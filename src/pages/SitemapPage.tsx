import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { setSEOMeta } from '@/lib/seoHelpers'

const SITE_URL = 'https://updro.se'

const SitemapPage = () => {
  const [xml, setXml] = useState('')

  useEffect(() => {
    setSEOMeta({ title: 'Sitemap | Updro', description: 'Sitemap för Updro.se', noindex: true })
    
    // Dynamic import to avoid bundling issues
    import('@/lib/seoHelpers').then(({ getAllSiteUrls }) => {
      const urls = getAllSiteUrls()
      const today = new Date().toISOString().split('T')[0]
      const entries = urls.map(u => 
        `  <url>\n    <loc>${SITE_URL}${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u === '/' ? 'daily' : 'weekly'}</changefreq>\n    <priority>${u === '/' ? '1.0' : u.split('/').length <= 2 ? '0.8' : '0.6'}</priority>\n  </url>`
      ).join('\n')
      setXml(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`)
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-12 flex-1">
        <h1 className="font-display text-3xl font-bold mb-4">Sitemap</h1>
        <p className="text-muted-foreground mb-6">
          Denna sida listar alla {xml ? xml.split('<url>').length - 1 : '...'} URL:er på Updro.se. 
          Ladda ner XML-versionen för att skicka till Google Search Console.
        </p>
        <div className="flex gap-3 mb-8">
          <a 
            href={`data:text/xml;charset=utf-8,${encodeURIComponent(xml)}`} 
            download="sitemap.xml"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Ladda ner sitemap.xml
          </a>
        </div>
        <pre className="bg-muted rounded-xl p-4 text-xs overflow-x-auto max-h-[600px] overflow-y-auto">
          {xml || 'Genererar...'}
        </pre>
      </div>
      <Footer />
    </div>
  )
}

export default SitemapPage
