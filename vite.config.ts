import { defineConfig } from "vite";
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
      // At build time, dynamically import the data to generate sitemap
      // We construct the XML inline from the same data sources
      const seoData = await import('./src/lib/seoData');
      const seoCities = await import('./src/lib/seoCities');
      const seoComparisons = await import('./src/lib/seoComparisons');
      const seoArticles = await import('./src/lib/seoArticles');
      const seoTools = await import('./src/lib/seoTools');

      const today = new Date().toISOString().split('T')[0];
      const BASE = 'https://updro.se';

      interface Entry { loc: string; changefreq: string; priority: number }
      const entries: Entry[] = [
        { loc: '/', changefreq: 'daily', priority: 1.0 },
        { loc: '/publicera', changefreq: 'weekly', priority: 0.8 },
        { loc: '/byraer', changefreq: 'weekly', priority: 0.8 },
        { loc: '/priser', changefreq: 'weekly', priority: 0.8 },
        { loc: '/om-oss', changefreq: 'monthly', priority: 0.6 },
        { loc: '/artiklar', changefreq: 'weekly', priority: 0.8 },
        { loc: '/verktyg', changefreq: 'weekly', priority: 0.8 },
        { loc: '/stader', changefreq: 'weekly', priority: 0.8 },
        { loc: '/jamfor', changefreq: 'weekly', priority: 0.8 },
        { loc: '/guider', changefreq: 'weekly', priority: 0.7 },
        { loc: '/integritetspolicy', changefreq: 'monthly', priority: 0.3 },
        { loc: '/villkor', changefreq: 'monthly', priority: 0.3 },
      ];

      for (const page of seoData.SEO_PAGES) {
        entries.push({ loc: `/${page.categorySlug}`, changefreq: 'weekly', priority: 0.9 });
        for (const sub of page.subPages) {
          entries.push({ loc: `/${page.categorySlug}/${sub.slug}`, changefreq: 'weekly', priority: 0.7 });
        }
      }
      for (const city of seoCities.CITIES) {
        entries.push({ loc: `/stader/${city.slug}`, changefreq: 'weekly', priority: 0.7 });
      }
      for (const comp of seoComparisons.COMPARISON_PAGES) {
        entries.push({ loc: `/${comp.slug}`, changefreq: 'monthly', priority: 0.8 });
      }
      for (const article of seoArticles.ARTICLES) {
        entries.push({ loc: `/artiklar/${article.slug}`, changefreq: 'monthly', priority: 0.7 });
      }
      for (const tool of seoTools.TOOLS) {
        entries.push({ loc: `/verktyg/${tool.slug}`, changefreq: 'monthly', priority: 0.7 });
      }

      const urls = entries.map(e =>
        `  <url><loc>${BASE}${e.loc}</loc><lastmod>${today}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`
      ).join('\n');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: xml,
      });

      console.log(`✅ sitemap.xml generated (${entries.length} URLs)`);
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