import { Text } from 'jsx-email'
import { EmailLayout } from '../layout'
import { EmailTemplateProps } from '../types'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
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

export const templateName = 'Email Test'

const { exp } = createVariablesHelper('email-test.ftl')

export const Template = ({ locale }: EmailTemplateProps) => (
  <EmailLayout preview={t`Here is a preview`} locale={locale}>
    <Text style={paragraph}>
      <Trans>This is a test message from ${exp('realmName')}</Trans>
    </Text>
  </EmailLayout>
)
