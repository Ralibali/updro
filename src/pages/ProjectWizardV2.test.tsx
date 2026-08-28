import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { PROJECT_DESCRIPTION_EXAMPLE } from '@/lib/wizardPrefill'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    profile: null,
    supplierProfile: null,
    loading: false,
    isAuthenticated: false,
    isBuyer: false,
    isSupplier: false,
    isAdmin: false,
    isOnTrial: false,
    trialLeadsLeft: 0,
    trialDaysLeft: 0,
    trialExpired: false,
    hasActiveSubscription: false,
    canUnlockLeads: false,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => {},
    refreshProfile: async () => {},
  }),
}))

vi.mock('@/components/Navbar', () => ({ default: () => <nav>Nav</nav> }))
vi.mock('@/components/Footer', () => ({ default: () => <footer>Footer</footer> }))
vi.mock('@/hooks/usePageTracking', () => ({ trackClick: () => {} }))
vi.mock('@/lib/analytics', () => ({
  trackLeadStarted: () => {},
  trackLeadSubmitted: () => {},
  trackOnceInSession: (_key: string, fn: () => void) => fn(),
  trackCategorySelected: () => {},
  trackUppdragDetailsCompleted: () => {},
}))

import ProjectWizardV2 from './ProjectWizardV2'

const renderWizard = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/publicera" element={<ProjectWizardV2 />} />
        <Route path="/publicera/:kategori" element={<ProjectWizardV2 />} />
      </Routes>
    </MemoryRouter>,
  )

const fillDescription = () => {
  fireEvent.change(screen.getByLabelText(/Beskriv uppdraget/), {
    target: { value: 'Ny hemsida med bokning.' },
  })
}

const goToStep2 = () => {
  fillDescription()
  const category = screen.getByRole('button', { name: /Webbutveckling/ })
  if (category.getAttribute('aria-pressed') !== 'true') {
    fireEvent.click(category)
  }
  fireEvent.click(screen.getByRole('button', { name: /Nästa/ }))
}

describe('ProjectWizardV2 step 1 helper/placeholder', () => {
  it('visar konkret exempel som placeholder och tom-helper', () => {
    renderWizard('/publicera')

    expect(screen.getByLabelText(/Beskriv uppdraget/)).toHaveAttribute(
      'placeholder',
      PROJECT_DESCRIPTION_EXAMPLE,
    )
    expect(screen.getByText(PROJECT_DESCRIPTION_EXAMPLE, { exact: false })).toBeInTheDocument()
    expect(screen.queryByText(/minst 10 tecken/i)).not.toBeInTheDocument()
  })

  it('visar inte AI-assistenten – bara beskrivningsfält, kategori och Nästa', () => {
    renderWizard('/publicera')

    expect(screen.getByLabelText(/Beskriv uppdraget/)).toBeInTheDocument()
    expect(screen.getByText('Kategori *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Nästa/ })).toBeInTheDocument()
    expect(screen.queryByText('AI-projektassistent')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Få AI-förslag/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Förbättra beskrivningen med AI/ })).not.toBeInTheDocument()
  })
})

describe('ProjectWizardV2 step 1 category', () => {
  it('håller Nästa inaktiverad utan kategori, även med tillräcklig beskrivning', () => {
    renderWizard('/publicera')
    fillDescription()

    expect(screen.getByRole('button', { name: /Nästa/ })).toBeDisabled()
    expect(screen.getByText('Välj en kategori för att fortsätta.')).toBeInTheDocument()
  })

  it('låter köparen välja kategori på steg 1 och då aktivera Nästa', () => {
    renderWizard('/publicera')
    fillDescription()
    fireEvent.click(screen.getByRole('button', { name: /Webbutveckling/ }))

    expect(screen.getByRole('button', { name: /Webbutveckling/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Nästa/ })).toBeEnabled()
  })
})

describe('ProjectWizardV2 category prefill', () => {
  it('förväljer Webbutveckling från /publicera/webbutveckling', () => {
    renderWizard('/publicera/webbutveckling')
    fillDescription()

    expect(screen.getByRole('button', { name: /Webbutveckling/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Nästa/ })).toBeEnabled()
  })

  it('förväljer kategori från ?kategori= som tidigare', () => {
    renderWizard('/publicera?kategori=SEO')

    expect(screen.getByRole('button', { name: /^SEO$/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Webbutveckling/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('behåller ?beskrivning= och låter query-kategori vinna över sökväg', () => {
    renderWizard('/publicera/webbutveckling?kategori=SEO&beskrivning=Vi%20beh%C3%B6ver%20hj%C3%A4lp%20med%20s%C3%B6k')

    expect(screen.getByLabelText(/Beskriv uppdraget/)).toHaveValue('Vi behöver hjälp med sök')
    expect(screen.getByRole('button', { name: /^SEO$/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Nästa/ })).toBeEnabled()
  })
})

describe('ProjectWizardV2 step 2 budget/start defaults', () => {
  it('förväljer Vet ej / Diskuteras och Flexibelt, utan kategorirutnät', () => {
    renderWizard('/publicera')
    goToStep2()

    expect(screen.getByRole('button', { name: /Vet ej \/ Diskuteras/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Flexibelt/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('Kategori *')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Webbutveckling/ })).not.toBeInTheDocument()
    expect(screen.getByText(/Fyll i namn, giltig e-post för att skicka/)).toBeInTheDocument()
  })

  it('låter köparen byta budget och start', () => {
    renderWizard('/publicera')
    goToStep2()

    fireEvent.click(screen.getByRole('button', { name: /Under 10 000 kr/ }))
    fireEvent.click(screen.getByRole('button', { name: /Snarast möjligt/ }))

    expect(screen.getByRole('button', { name: /Under 10 000 kr/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Vet ej \/ Diskuteras/ })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: /Snarast möjligt/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Flexibelt/ })).toHaveAttribute('aria-pressed', 'false')
  })
})
