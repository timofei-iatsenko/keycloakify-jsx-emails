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

export const templateName = 'Email Update Confirmation'

const { exp } = createVariablesHelper('email-update-confirmation.ftl')

export const Template = ({ locale }: EmailTemplateProps) => (
  <EmailLayout preview={t`Here is a preview`} locale={locale}>
    <Text style={paragraph}>
      <Trans>
        <p>
          To update your {exp('realmName')} account with email address{' '}
          {exp('newEmail')}, click the link below
        </p>
        <p>
          <a href={exp('link')}>{exp('link')}</a>
        </p>
        <p>
          This link will expire within{' '}
          {exp('linkExpirationFormatter(linkExpiration)')}.
        </p>
        <p>
          If you don't want to proceed with this modification, just ignore this
          message.
        </p>
      </Trans>
    </Text>
  </EmailLayout>
)