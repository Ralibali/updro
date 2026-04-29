import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { Plugin, ViteDevServer } from "vite";

function sitemapPlugin(): Plugin {
  let server: ViteDevServer | undefined;

  return {
    name: 'vite-plugin-dynamic-sitemap',
    configureServer(s) {
      server = s;
      s.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        const match = url.match(/^\/(sitemap(?:-[a-z]+)?|sitemap-index)\.xml(?:\?.*)?$/);
        if (!match) return next();
        try {
          const mod = await s.ssrLoadModule('/src/lib/seoHelpers.ts');
          const name = match[1];
          let xml: string | null = null;
          if (name === 'sitemap') xml = mod.generateSitemapXml();
          else if (name === 'sitemap-index') xml = mod.generateSitemapIndexXml();
          else {
            const section = name.replace(/^sitemap-/, '');
            xml = mod.generateSectionSitemapXml(section);
          }
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
    async generateBundle() {
      const mod = await import('./src/lib/seoHelpers');

      // Flat sitemap (kept for backward compatibility / fallback)
      const flat = mod.generateSitemapXml();
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: flat });

      // Sitemap index + per-section sitemaps
      const indexXml = mod.generateSitemapIndexXml();
      this.emitFile({ type: 'asset', fileName: 'sitemap-index.xml', source: indexXml });

      const sections = mod.SITEMAP_SECTIONS as Array<Parameters<typeof mod.generateSectionSitemapXml>[0]>;
      let total = 0;
      for (const section of sections) {
        const xml = mod.generateSectionSitemapXml(section);
        if (!xml) continue;
        this.emitFile({ type: 'asset', fileName: `sitemap-${section}.xml`, source: xml });
        total += (xml.match(/<url>/g) || []).length;
      }

      const flatCount = (flat.match(/<url>/g) || []).length;
      console.log(`✅ sitemap.xml (${flatCount}) + sitemap-index.xml (${sections.length} sections, ${total} URLs) generated`);
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
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZ2pvZXZ2bHdoc2Rkc2NxbXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjQ4MjksImV4cCI6MjA4ODU0MDgyOX0.RzQd73CM17YP3tXgp3L9od0RvCS4oYJhyAvLP2t6fj4'),
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
      sitemapPlugin(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});