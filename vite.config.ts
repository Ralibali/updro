import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { Plugin } from "vite";
import {
  generateSectionSitemapXml,
  generateSitemapIndexXml,
  generateSitemapXml,
  getIndexableSeoRoutes,
  getNoindexSeoRoutes,
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

      const flatCount = (flat.match(/<url>/g) || []).length;
      const noindexCount = getNoindexSeoRoutes().length;
      const routeCount = getIndexableSeoRoutes().length + noindexCount;
      console.log(`✅ SEO build: sitemap generated for ${flatCount} indexable URLs, ${sectionUrlCount} section URLs, ${noindexCount} noindex programmatic URLs, ${routeCount} registered routes`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')),
      __BUILD_REV__: JSON.stringify('react-chunk-fix-v2'),
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
    build: {
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            // React core MUST be in its own chunk and include all transitive deps
            // (scheduler, react-is, use-sync-external-store, object-assign) so other
            // chunks don't try to use React APIs before it's initialized.
            if (
              /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|react-is|use-sync-external-store|object-assign)[\\/]/.test(id)
            ) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            return 'vendor';
          },
        },
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
