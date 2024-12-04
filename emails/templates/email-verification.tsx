import { Text } from "jsx-email";
import { EmailLayout } from "@/layout";
import { GetTemplateProps, GetSubject, GetTemplate } from "../types";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { createVariablesHelper } from "../email-vars";
import { createElement } from "react";
import { render } from "../render";

interface TemplateProps extends Omit<GetTemplateProps, "plainText"> {}

const paragraph = {
  color: "#777",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

export const previewProps: TemplateProps = {
  locale: "en",
  themeName: "vanilla",
};

export const templateName = "Email Verification";

const { exp } = createVariablesHelper("email-verification.ftl");

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout preview={t`Here is a preview`} locale={locale}>
    <Text style={paragraph}>
      <Trans>
        <p>
          Someone has created a {exp("user.firstName")} account with this email address.
          If this was you, click the link below to verify your email address
        </p>
        <p>
          <a href={exp("link")}>Link to e-mail address verification</a>
        </p>
        <p>
          This link will expire within {exp("linkExpirationFormatter(linkExpiration)")}.
        </p>
        <p>If you didn't create this account, just ignore this message.</p>
      </Trans>
    </Text>
  </EmailLayout>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(createElement(Template, props), props.plainText);
};

export const getSubject: GetSubject = async (_props) => {
  return "Verify email";
};
