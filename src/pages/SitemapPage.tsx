import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { setSEOMeta } from '@/lib/seoHelpers'

const SITE_URL = 'https://updro.se'

const SitemapPage = () => {
  useEffect(() => {
    setSEOMeta({ title: 'Sitemap | Updro', description: 'Sitemap för Updro.se', noindex: true })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-12 flex-1">
        <h1 className="font-display text-3xl font-bold mb-4">Sitemap</h1>
        <p className="text-muted-foreground mb-6">
          Updro.se har en statisk sitemap.xml som serveras direkt. Den kan skickas till Google Search Console.
        </p>
        <div className="flex gap-3 mb-8">
          <a 
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Visa sitemap.xml
          </a>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default SitemapPage
