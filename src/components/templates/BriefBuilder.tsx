import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Clipboard, Download, FileText, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { trackClick } from '@/hooks/usePageTracking'
import { storeBriefHandoff } from '@/lib/briefHandoff'
import type { BriefTemplate } from '@/lib/briefTemplates'

interface BriefBuilderProps {
  template: BriefTemplate
}

const buildBrief = (template: BriefTemplate, answers: Record<string, string>) => {
  const sections = template.questions
    .map(question => ({ label: question.label, value: (answers[question.id] || '').trim() }))
    .filter(section => section.value)
    .map(section => `## ${section.label}\n${section.value}`)

  return [
    `# Projektbrief – ${template.shortTitle}`,
    '',
    'Den här briefen är framtagen som beslutsunderlag. Budget och önskad start väljs separat när uppdraget publiceras.',
    '',
    ...sections.flatMap(section => [section, '']),
    '## Bra att be leverantören tydliggöra',
    ...template.checklist.map(item => `- ${item}`),
  ].join('\n').trim()
}

const BriefBuilder = ({ template }: BriefBuilderProps) => {
  const navigate = useNavigate()
  const started = useRef(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [brief, setBrief] = useState('')

  const requiredReady = useMemo(
    () => template.questions.filter(question => question.required).every(question => (answers[question.id] || '').trim().length >= 3),
    [answers, template.questions],
  )
  const briefReady = brief.trim().length >= 10

  const updateAnswer = (id: string, value: string) => {
    if (!started.current) {
      started.current = true
      trackClick('brief_builder_started', 'Brief Builder Started', { template: template.slug })
    }
    setAnswers(previous => ({ ...previous, [id]: value }))
  }

  const generate = () => {
    if (!requiredReady) {
      toast.error('Fyll i de obligatoriska frågorna först.')
      return
    }
    const nextBrief = buildBrief(template, answers)
    setBrief(nextBrief)
    trackClick('brief_builder_completed', 'Brief Builder Completed', { template: template.slug })
  }

  const copy = async () => {
    if (!briefReady) return
    try {
      await navigator.clipboard.writeText(brief.trim())
      toast.success('Briefen är kopierad.')
    } catch {
      toast.error('Kunde inte kopiera automatiskt. Markera texten och kopiera manuellt.')
    }
  }

  const download = () => {
    if (!briefReady) return
    const blob = new Blob([brief.trim()], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `updro-brief-${template.slug}.txt`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const continueToProject = () => {
    if (!briefReady) return
    if (!storeBriefHandoff(brief)) {
      toast.error('Kunde inte föra över briefen säkert. Kopiera den och försök igen.')
      return
    }
    trackClick('brief_to_publicera', 'Brief To Publicera', { template: template.slug })
    navigate(template.categorySlug ? `/publicera/${template.categorySlug}` : '/publicera')
  }

  return (
    <section className="rounded-3xl border bg-card p-5 sm:p-8 shadow-sm" aria-labelledby="brief-builder-heading">
      <div className="flex items-start gap-3 mb-7">
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary"><FileText className="h-5 w-5" /></div>
        <div>
          <h2 id="brief-builder-heading" className="text-xl sm:text-2xl font-bold">Bygg din brief</h2>
          <p className="text-sm text-muted-foreground mt-1">Svara med egna ord. Vi frågar inte efter namn, e-post eller telefon här.</p>
        </div>
      </div>

      <div className="space-y-6">
        {template.questions.map(question => (
          <div key={question.id}>
            <Label htmlFor={`brief-${template.slug}-${question.id}`} className="text-sm font-semibold">
              {question.label}{question.required ? ' *' : ''}
            </Label>
            <Textarea
              id={`brief-${template.slug}-${question.id}`}
              value={answers[question.id] || ''}
              onChange={event => updateAnswer(question.id, event.target.value)}
              placeholder={question.placeholder}
              maxLength={1800}
              className="mt-2 min-h-[100px] rounded-xl"
            />
          </div>
        ))}
      </div>

      <Button type="button" onClick={generate} disabled={!requiredReady} className="w-full mt-7 min-h-12 rounded-xl">
        <Check className="mr-2 h-4 w-4" /> Skapa min brief
      </Button>

      {brief.length > 0 && (
        <div className="mt-8 border-t pt-7">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="font-bold text-lg">Din redigerbara slutversion</h3>
              <p className="text-xs text-muted-foreground">Kontrollera och ändra innan du kopierar, laddar ner eller går vidare.</p>
            </div>
          </div>
          <Textarea
            aria-label="Redigerbar projektbrief"
            value={brief}
            onChange={event => setBrief(event.target.value)}
            className="min-h-[420px] rounded-xl font-mono text-sm"
            maxLength={5000}
          />
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <Button type="button" variant="outline" onClick={copy} disabled={!briefReady} className="min-h-11 rounded-xl">
              <Clipboard className="mr-2 h-4 w-4" /> Kopiera
            </Button>
            <Button type="button" variant="outline" onClick={download} disabled={!briefReady} className="min-h-11 rounded-xl">
              <Download className="mr-2 h-4 w-4" /> Ladda ner
            </Button>
            <Button type="button" onClick={continueToProject} disabled={!briefReady} className="min-h-11 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white">
              <Send className="mr-2 h-4 w-4" /> Gå till offert
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Briefen förs över i den här webbläsarfliken via tillfällig sessionslagring och läggs inte i URL:en.</p>
        </div>
      )}
    </section>
  )
}

export default BriefBuilder
