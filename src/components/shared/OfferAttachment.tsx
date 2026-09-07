import { useCallback, useEffect, useState } from 'react'
import { Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getOfferAttachmentSignedUrl } from '@/lib/marketplaceActions'

export default function OfferAttachment({ path }: { path: string | null }) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const load = useCallback(async () => {
    if (!path) return
    setLoading(true)
    setError(false)
    setUrl(null)
    try { setUrl(await getOfferAttachmentSignedUrl(path)) }
    catch { setError(true) }
    finally { setLoading(false) }
  }, [path])
  // Fetch on demand so the private link is fresh even after a long comparison.
  useEffect(() => { setUrl(null); setError(false) }, [path])
  useEffect(() => {
    if (!url) return
    const timer = setTimeout(() => setUrl(null), 9 * 60 * 1000)
    return () => clearTimeout(timer)
  }, [url])
  if (!path) return null
  return <div className="mt-3 text-sm">
    {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-medium text-primary underline"><Paperclip className="h-4 w-4" />Öppna offertbilaga</a>
      : <Button type="button" size="sm" variant="outline" onClick={load} disabled={loading}><Paperclip className="mr-2 h-4 w-4" />{loading ? 'Hämtar bilaga…' : error ? 'Försök hämta bilagan igen' : 'Visa offertbilaga'}</Button>}
    {error && <p role="alert" className="mt-1 text-destructive">Bilagan kunde inte hämtas. Försök igen.</p>}
  </div>
}
