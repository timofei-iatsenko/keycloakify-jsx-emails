import { Body, Container, Head, Html, Preview, Section } from 'jsx-email'
import { PropsWithChildren, ReactNode } from 'react'
import { LinguiEmailProvider } from './i18n/provider'

/* eslint-disable lingui/no-unlocalized-strings */
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginBottom: '64px',
  padding: '20px 0 48px',
}

const box = {
  padding: '0 48px',
}
/* eslint-enable lingui/no-unlocalized-strings */

export const EmailLayout = ({
  locale,
  children,
  preview,
}: PropsWithChildren<{ preview: ReactNode; locale: string }>) => {
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <LinguiEmailProvider locale={locale}>
          <Container style={container}>
            <Section style={box}>{children}</Section>
          </Container>
        </LinguiEmailProvider>
      </Body>
    </Html>
  )
}
