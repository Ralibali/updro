import { useId, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { trackLeadStarted } from '@/lib/analytics'
import { trackClick } from '@/hooks/usePageTracking'

interface InlineBriefFormProps {
  /** Kategori som wizarden accepterar (se CATEGORIES), förväljs vid submit. */
  category?: string
  placeholder?: string
  /** Används i analytics för att se vilka sidor som genererar leads. */
  source: string
  submitLabel?: string
  className?: string
  /** Förifylld text, t.ex. från annonsens sökord. */
  initialDescription?: string
}

/**
 * Låter besökaren börja skriva sin brief direkt på sidan och tar med texten
 * och kategorin in i /publicera – samma väg som startsidans hero.
 */
const InlineBriefForm = ({
  category,
  placeholder = 'Beskriv kort vad du behöver hjälp med – t.ex. mål, bransch och ungefärlig budget…',
  source,
  submitLabel = 'Få offerter gratis',
  className = '',
  initialDescription = '',
}: InlineBriefFormProps) => {
  const navigate = useNavigate()
  const id = useId()
  const [description, setDescription] = useState(initialDescription)

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    const text = description.trim()
    const params = new URLSearchParams()
    if (category) params.set('kategori', category)
    if (text) params.set('beskrivning', text.slice(0, 2000))
    trackLeadStarted(source)
    trackClick('lead_started', submitLabel, { source, has_description: Boolean(text), category: category || 'none' })
    const query = params.toString()
    navigate(query ? `/publicera?${query}` : '/publicera')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) submit()
  }

  return (
    <form
      onSubmit={submit}
      aria-label="Starta din förfrågan"
      className={`rounded-2xl border border-border bg-card text-left shadow-lg ring-4 ring-primary/5 transition focus-within:border-primary/50 focus-within:ring-primary/15 ${className}`}
    >
      <label htmlFor={id} className="sr-only">Beskriv ditt projekt</label>
      <textarea
        id={id}
        rows={3}
        maxLength={2000}
        value={description}
        onChange={e => setDescription(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="block w-full resize-none bg-transparent px-5 pt-4 pb-2 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/80 outline-none"
      />
      <div className="flex flex-col gap-2 px-3 pb-3 sm:flex-row sm:items-center sm:justify-between sm:pl-5">
        <p className="text-xs text-muted-foreground">Gratis · Inget konto krävs · Högst tre offerter</p>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 motion-safe:active:scale-[0.98]"
        >
          {submitLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}

export default InlineBriefForm
