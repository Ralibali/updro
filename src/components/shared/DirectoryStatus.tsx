import { Button } from '@/components/ui/button'

export default function DirectoryStatus({ loading, error, retry }: { loading: boolean; error: boolean; retry: () => void }) {
  if (loading) return <p role="status" className="rounded-2xl border bg-muted/30 p-6 text-muted-foreground">Hämtar byråer…</p>
  if (error) return (
    <div role="alert" className="rounded-2xl border p-6">
      <p>Byrålistan kunde inte hämtas just nu.</p>
      <Button variant="outline" className="mt-4" onClick={retry}>Försök igen</Button>
    </div>
  )
  return null
}
