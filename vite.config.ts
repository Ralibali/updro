import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { Plugin } from "vite";
import {
  generateSectionSitemapXml,
  generateSitemapIndexXml,
  generateSitemapXml,
  getAllStaticSeoRoutes,
  getNoindexSeoRoutes,
  renderStaticHtml,
  SITEMAP_SECTIONS,
} from "./src/lib/seoStatic";

function seoBuildPlugin(): Plugin {
  return {
    name: 'vite-plugin-updro-seo-build',
    configureServer(s) {
      s.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        const match = url.match(/^\/(sitemap(?:-[a-z]+)?|sitemap-index)\.xml(?:\?.*)?$/);
        if (!match) return next();
        try {
          const name = match[1];
          let xml: string | null = null;
          if (name === 'sitemap') xml = generateSitemapXml();
          else if (name === 'sitemap-index') xml = generateSitemapIndexXml();
          else xml = generateSectionSitemapXml(name.replace(/^sitemap-/, '') as any);
          if (!xml) {
            res.statusCode = 404;
            res.end('Not found');
            return;
          }
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.end(xml);
        } catch (e) {
          console.error('Sitemap generation error:', e);
          next(e);
        }
      });
    },
    async closeBundle() {
      const fs = await import('node:fs/promises');
      const distDir = path.resolve(process.cwd(), 'dist');
      const template = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');

      const flat = generateSitemapXml();
      await fs.writeFile(path.join(distDir, 'sitemap.xml'), flat, 'utf8');

      const indexXml = generateSitemapIndexXml();
      await fs.writeFile(path.join(distDir, 'sitemap-index.xml'), indexXml, 'utf8');

      let sectionUrlCount = 0;
      for (const section of SITEMAP_SECTIONS) {
        const xml = generateSectionSitemapXml(section);
        if (!xml) continue;
        await fs.writeFile(path.join(distDir, `sitemap-${section}.xml`), xml, 'utf8');
        sectionUrlCount += (xml.match(/<url>/g) || []).length;
      }

      const routes = getAllStaticSeoRoutes();
      for (const route of routes) {
        const routeHtml = renderStaticHtml(template, route);
        const routeDir = path.join(distDir, route.path === '/' ? '' : route.path.replace(/^\//, ''));
        await fs.mkdir(routeDir, { recursive: true });
        await fs.writeFile(path.join(routeDir, 'index.html'), routeHtml, 'utf8');
      }

      const flatCount = (flat.match(/<url>/g) || []).length;
      const noindexCount = getNoindexSeoRoutes().length;
      console.log(`✅ SEO build: ${routes.length} HTML routes, ${flatCount} indexable sitemap URLs, ${sectionUrlCount} section URLs, ${noindexCount} noindex programmatic URLs`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || 'https://opgjoevvlwhsddscqmpe.supabase.co'),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJvcGdqb2V2dmx3aHNkZHNjcW1wZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcyOTY0ODI5LCJleHAiOjIwODg1NDA4Mjl9.RzQd73CM17YP3tXgp3L9od0RvCS4oYJhyAvLP2t6fj4'),
      'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify(env.VITE_SUPABASE_PROJECT_ID || 'opgjoevvlwhsddscqmpe'),
    },
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      seoBuildPlugin(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
