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
      // Serve /sitemap.xml dynamically during dev
      s.middlewares.use(async (req, res, next) => {
        if (req.url !== '/sitemap.xml') return next();
        try {
          const mod = await s.ssrLoadModule('/src/lib/seoHelpers.ts');
          const xml = mod.generateSitemapXml();
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.end(xml);
        } catch (e) {
          console.error('Sitemap generation error:', e);
          next(e);
        }
      });
    },
    async generateBundle() {
      // Single source of truth: re-use generateSitemapXml from seoHelpers
      const mod = await import('./src/lib/seoHelpers');
      const xml = mod.generateSitemapXml();

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: xml,
      });

      const count = (xml.match(/<url>/g) || []).length;
      console.log(`✅ sitemap.xml generated (${count} URLs)`);
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