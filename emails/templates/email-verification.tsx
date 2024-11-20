import { Text } from 'jsx-email'
import { EmailLayout } from '@/layout'
import { EmailTemplateProps } from '../types'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { createVariablesHelper } from '../email-vars'

interface TemplateProps extends EmailTemplateProps {}

const paragraph = {
  color: '#777',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
}

export const previewProps: TemplateProps = {
  locale: 'en',
  themeName: 'vanilla',
}

export const templateName = 'Email Verification'

const { exp } = createVariablesHelper('email-verification.ftl')

export const Template = ({ locale }: EmailTemplateProps) => (
  <EmailLayout preview={t`Here is a preview`} locale={locale}>
    <Text style={paragraph}>
      <Trans>
        <p>
          Someone has created a {exp('realmName')} account with this email
          address. If this was you, click the link below to verify your email
          address
        </p>
        <p>
          <a href={exp('link')}>Link to e-mail address verification</a>
        </p>
        <p>
          This link will expire within{' '}
          {exp('linkExpirationFormatter(linkExpiration)')}.
        </p>
        <p>If you didn't create this account, just ignore this message.</p>
      </Trans>
    </Text>
  </EmailLayout>
)
