import { render, Text } from "jsx-email";
import { EmailLayout } from "@/layout";
import { GetTemplateProps, GetSubject, GetTemplate } from "../types";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { createVariablesHelper } from "../email-vars";
import { createElement } from "react";

interface TemplateProps extends GetTemplateProps {}

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

export const templateName = "Email Update Confirmation";

const { exp } = createVariablesHelper("email-update-confirmation.ftl");

export const Template = ({ locale }: GetTemplateProps) => (
  <EmailLayout preview={t`Here is a preview`} locale={locale}>
    <Text style={paragraph}>
      <Trans>
        <p>
          To update your {exp("realmName")} account with email address {exp("newEmail")},
          click the link below
        </p>
        <p>
          <a href={exp("link")}>{exp("link")}</a>
        </p>
        <p>
          This link will expire within {exp("linkExpirationFormatter(linkExpiration)")}.
        </p>
        <p>
          If you don't want to proceed with this modification, just ignore this message.
        </p>
      </Trans>
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
  return "Verify new email";
};
