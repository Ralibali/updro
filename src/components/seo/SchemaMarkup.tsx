import type { SEOPillarPage, SEOSubPage } from '@/lib/seoData'

interface SchemaMarkupProps {
  page: SEOPillarPage | SEOSubPage
  type: 'pillar' | 'sub'
  parentCategory?: string
  parentSlug?: string
}

const SchemaMarkup = ({ page, type, parentCategory, parentSlug }: SchemaMarkupProps) => {
  const isPillar = type === 'pillar'
  const pillar = page as SEOPillarPage
  const sub = page as SEOSubPage

  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://updro.se/' },
  ]

  if (isPillar) {
    breadcrumbItems.push({
      '@type': 'ListItem', position: 2, name: pillar.categoryName,
      item: `https://updro.se/${pillar.categorySlug}/`
    })
  } else if (parentSlug && parentCategory) {
    breadcrumbItems.push({
      '@type': 'ListItem', position: 2, name: parentCategory,
      item: `https://updro.se/${parentSlug}/`
    })
    breadcrumbItems.push({
      '@type': 'ListItem', position: 3, name: sub.h1,
      item: `https://updro.se/${parentSlug}/${sub.slug}/`
    })
  }

  const faqItems = ('faq' in page ? page.faq : [])

  const schemas = [
    // Organization
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Updro',
      url: 'https://updro.se',
      description: 'Updro hjälper företag att hitta rätt digitala byråer genom att jämföra offerter kostnadsfritt.',
    },
    // Service
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: isPillar ? pillar.categoryName : sub.h1,
      description: isPillar ? pillar.metaDesc : sub.metaDesc,
      provider: { '@type': 'Organization', name: 'Updro' },
      areaServed: { '@type': 'Country', name: 'Sweden' },
    },
    // Breadcrumb
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems,
    },
  ]

  // FAQ schema
  if (faqItems.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    } as any)
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
    </>
  )
}

export default SchemaMarkup
