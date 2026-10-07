type AuthError = { code?: string; name?: string; status?: number }

export const loginErrorMessage = (error: AuthError): string => {
  if (error.code === 'email_not_confirmed') return 'Din e-postadress är inte bekräftad. Öppna mejlet från Updro eller skicka bekräftelsen igen nedan.'
  if (error.code === 'invalid_credentials') return 'Fel e-postadress eller lösenord. Kontrollera uppgifterna och försök igen.'
  if (error.status === 429 || error.code === 'over_request_rate_limit') return 'För många inloggningsförsök. Vänta en stund och försök igen.'
  if (error.name === 'AuthRetryableFetchError') return 'Inloggningstjänsten kunde inte nås. Kontrollera anslutningen och försök igen.'
  return 'Det gick inte att logga in just nu. Försök igen om en stund.'
}

export const confirmationErrorMessage = (error: AuthError): string => {
  if (error.status === 429 || error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit') {
    return 'För många bekräftelsemejl har begärts. Vänta en minut innan du försöker igen.'
  }
  return 'Bekräftelsemejlet kunde inte skickas just nu. Försök igen om en stund eller kontakta support.'
}
