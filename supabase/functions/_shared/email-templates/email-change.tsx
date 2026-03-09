/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="sv" dir="ltr">
    <Head />
    <Preview>Bekräfta byte av e-postadress på Updro</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={logoText}>🔥 updro</Text>
        <Heading style={h1}>Bekräfta ny e-postadress</Heading>
        <Text style={text}>
          Du har begärt att byta e-postadress på Updro från{' '}
          <Link href={`mailto:${email}`} style={link}>
            {email}
          </Link>{' '}
          till{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Text style={text}>
          Klicka på knappen nedan för att bekräfta bytet:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Bekräfta e-postbyte
        </Button>
        <Text style={footer}>
          Har du inte begärt detta? Säkra ditt konto omedelbart.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '40px 25px' }
const logoText = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  fontFamily: "'Space Grotesk', Arial, sans-serif",
  color: '#141321',
  margin: '0 0 30px',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  fontFamily: "'Space Grotesk', Arial, sans-serif",
  color: '#141321',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#838191',
  lineHeight: '1.6',
  margin: '0 0 25px',
}
const link = { color: '#6348E9', textDecoration: 'underline' }
const button = {
  backgroundColor: '#6348E9',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '12px',
  padding: '14px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
