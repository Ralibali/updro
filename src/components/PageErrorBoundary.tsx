import { Component, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  embedded?: boolean
}

/** A failed route or lazy section must leave visitors with a way forward. */
class PageErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <section className={this.props.embedded ? 'container py-12' : 'container flex min-h-screen items-center justify-center py-12'} aria-label="Sidan kunde inte laddas">
        <div className="w-full max-w-xl rounded-2xl border bg-card p-6 shadow-sm md:p-8" role="alert">
          <h2 className="font-display text-2xl">Vi kunde inte ladda {this.props.embedded ? 'hela sidan' : 'sidan'}.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Kontrollera anslutningen och försök igen. Om Updro precis har uppdaterats kan sidan behöva laddas om.</p>
          <p className="mt-2 text-xs text-muted-foreground">Kopiera eventuell osparad text innan du laddar om.</p>
          <Button className="mt-5" onClick={() => window.location.reload()}><RefreshCw aria-hidden="true" /> Ladda om sidan</Button>
        </div>
      </section>
    )
  }
}

export default PageErrorBoundary
