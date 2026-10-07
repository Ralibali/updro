import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ signIn: vi.fn(), resend: vi.fn(), verifyOtp: vi.fn(), signUp: vi.fn() }))
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ signIn: mocks.signIn, signUp: mocks.signUp, profile: null }) }))
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { resend: mocks.resend, verifyOtp: mocks.verifyOtp } } }))
vi.mock('@/components/Navbar', () => ({ default: () => <nav /> }))
vi.mock('@/components/Footer', () => ({ default: () => <footer /> }))
import LoginPage from './LoginPage'
import ConfirmEmailPage from './ConfirmEmailPage'
import ResendConfirmation from '@/components/ResendConfirmation'
import RegisterPage from './RegisterPage'
import { signupConfirmationLink } from '../../supabase/functions/_shared/confirmation-link'

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  window.history.replaceState({}, '', '/')
  mocks.resend.mockResolvedValue({ error: null })
})
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals() })

it.each([
  ['invalid_credentials', 'Fel e-postadress eller lösenord.'],
  ['email_not_confirmed', 'Din e-postadress är inte bekräftad.'],
])('explains %s separately on the login form', async (code, message) => {
  mocks.signIn.mockResolvedValue({ error: { code } })
  render(<MemoryRouter><LoginPage /></MemoryRouter>)
  fireEvent.change(screen.getByLabelText('E-post'), { target: { value: 'user@example.test' } })
  fireEvent.change(screen.getByLabelText('Lösenord'), { target: { value: 'password' } })
  fireEvent.click(screen.getByRole('button', { name: 'Logga in' }))
  expect(await screen.findByRole('alert')).toHaveTextContent(message)
  expect(screen.getByRole('button', { name: 'Skicka bekräftelse igen' })).toBeEnabled()
})

it('resends signup confirmation to the typed address with cooldown, without a password reset', async () => {
  render(<ResendConfirmation email=" User@Example.test " />)
  fireEvent.click(screen.getByRole('button', { name: 'Skicka bekräftelse igen' }))
  await waitFor(() => expect(mocks.resend).toHaveBeenCalledWith({ type: 'signup', email: 'user@example.test', options: { emailRedirectTo: 'https://updro.se/logga-in?confirmed=true' } }))
  expect(await screen.findByRole('status')).toHaveTextContent('väntar på bekräftelse')
  expect(screen.getByRole('button', { name: /Skicka igen om/ })).toBeDisabled()
})

it('does not claim that a failed resend was sent', async () => {
  mocks.resend.mockResolvedValue({ error: { code: 'over_email_send_rate_limit', status: 429 } })
  render(<ResendConfirmation email="user@example.test" />)
  fireEvent.click(screen.getByRole('button', { name: 'Skicka bekräftelse igen' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Vänta en minut')
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('offers confirmation resend when registration finds an existing email', async () => {
  mocks.signUp.mockResolvedValue({ error: { message: 'Ett konto med den här e-postadressen finns redan.' } })
  render(<MemoryRouter><RegisterPage /></MemoryRouter>)
  fireEvent.change(screen.getByLabelText('Namn *'), { target: { value: 'Testperson' } })
  fireEvent.change(screen.getByLabelText('E-post *'), { target: { value: 'existing@example.test' } })
  fireEvent.change(screen.getByLabelText('Lösenord *'), { target: { value: 'local-password' } })
  fireEvent.click(screen.getByRole('checkbox', { name: /Jag godkänner/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Skapa beställarkonto' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('finns redan')
  fireEvent.click(screen.getByRole('button', { name: 'Skicka bekräftelse igen' }))
  await waitFor(() => expect(mocks.resend).toHaveBeenCalledWith(expect.objectContaining({ type: 'signup', email: 'existing@example.test' })))
})

it('verifies an Updro signup link only after a click, scrubs the token and accepts the session', async () => {
  const url = signupConfirmationLink('https://project.supabase.co/auth/v1/verify?token=test-hash&type=signup&redirect_to=https://evil.invalid', 'https://project.supabase.co')
  expect(url).toBe('https://updro.se/bekrafta-epost#token_hash=test-hash&type=email')
  window.history.replaceState({}, '', new URL(url).pathname + new URL(url).hash)
  mocks.verifyOtp.mockResolvedValue({ error: null })
  render(<MemoryRouter><ConfirmEmailPage /></MemoryRouter>)
  expect(window.location.hash).toBe('')
  expect(mocks.verifyOtp).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Bekräfta min e-post' }))
  expect(await screen.findByRole('status')).toHaveTextContent('Din e-postadress är bekräftad.')
  expect(mocks.verifyOtp).toHaveBeenCalledExactlyOnceWith({ token_hash: 'test-hash', type: 'email' })
})

it('offers a new confirmation for an expired token', async () => {
  window.history.replaceState({}, '', '/bekrafta-epost#token_hash=expired&type=email')
  mocks.verifyOtp.mockResolvedValue({ error: { code: 'otp_expired' } })
  render(<MemoryRouter><ConfirmEmailPage /></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: 'Bekräfta min e-post' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('gått ut')
  expect(screen.getByRole('button', { name: 'Skicka bekräftelse igen' })).toBeDisabled()
})

it('rejects non-signup or foreign verification links', () => {
  expect(() => signupConfirmationLink('https://project.supabase.co/auth/v1/verify?token=x&type=recovery', 'https://project.supabase.co')).toThrow()
  expect(() => signupConfirmationLink('https://evil.invalid/auth/v1/verify?token=x&type=signup', 'https://project.supabase.co')).toThrow()
})
