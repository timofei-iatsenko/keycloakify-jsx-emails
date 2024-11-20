import { Text } from 'jsx-email'
import { EmailLayout } from '@/layout'
import { EmailTemplateProps } from '../types'
import { Trans } from '@lingui/react/macro'
import * as Fm from '../freemarker/condition'
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

export const templateName = 'Org Invite'

const { exp, v } = createVariablesHelper('org-invite.ftl')

export const Template = ({ locale }: EmailTemplateProps) => (
  <EmailLayout preview={t`Here is a preview`} locale={locale}>
    <Text style={paragraph}>
      <Fm.If condition={`${v('firstName')}?? && ${v('lastName')}??`}>
        <p>
          <Trans>
            Hi, {exp('firstName')} {exp('lastName')}.
          </Trans>
        </p>
      </Fm.If>

      <Trans>
        <p>
          You were invited to join the {exp('organization.name')} organization.
          Click the link below to join.{' '}
        </p>
        <p>
          <a href={exp('link')}>Link to join the organization</a>
        </p>
        <p>
          This link will expire within{' '}
          {exp('linkExpirationFormatter(linkExpiration)')}.
        </p>
        <p>
          If you don't want to join the organization, just ignore this message.
        </p>
      </Trans>
    </Text>
  </EmailLayout>
)
