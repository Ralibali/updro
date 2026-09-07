import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Home, Search, FileText } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import DashboardLayout from './DashboardLayout'

vi.mock('@/components/Navbar', () => ({ default: () => null }))

describe('Dashboard navigation', () => {
  it('marks only the project section on a nested project page', () => {
    render(<MemoryRouter initialEntries={['/dashboard/supplier/uppdrag/example']}>
      <DashboardLayout navItems={[
        { label: 'Översikt', href: '/dashboard/supplier', icon: Home },
        { label: 'Uppdrag', href: '/dashboard/supplier/uppdrag', icon: Search },
        { label: 'Offerter', href: '/dashboard/supplier/offerter', icon: FileText },
      ]}><h1>Ett uppdrag</h1></DashboardLayout>
    </MemoryRouter>)
    for (const link of screen.getAllByRole('link', { name: 'Översikt' })) expect(link).not.toHaveAttribute('aria-current')
    for (const link of screen.getAllByRole('link', { name: 'Uppdrag' })) expect(link).toHaveAttribute('aria-current', 'page')
    for (const link of screen.getAllByRole('link', { name: 'Offerter' })) expect(link).not.toHaveAttribute('aria-current')
  })
})
