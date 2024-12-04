import { render, Text } from "jsx-email";
import { EmailLayout } from "../layout";
import { GetTemplateProps, GetSubject, GetTemplate } from "../types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { createVariablesHelper } from "../email-vars";
import { createElement } from "react";

interface TemplateProps extends GetTemplateProps {}

const paragraph = {
  color: "#777",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

export const previewProps: Partial<TemplateProps> = {
  locale: "en",
  themeName: "vanilla",
};

export const templateName = "Email Test";

const { exp } = createVariablesHelper("email-test.ftl");

export const Template = ({ locale }: GetTemplateProps) => (
  <EmailLayout preview={t`Here is a preview`} locale={locale}>
    <Text style={paragraph}>
      <Trans>This is a test message from ${exp("realmName")}</Trans>
    </Text>
  </EmailLayout>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(createElement(Template, props), {
    pretty: true,
    plainText: props.plainText,
  });
};

export const getSubject: GetSubject = async (_props) => {
  return "[KEYCLOAK] - SMTP test message";
};
