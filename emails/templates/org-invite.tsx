import { render, Text } from "jsx-email";
import { EmailLayout } from "@/layout";
import { GetTemplateProps, GetSubject, GetTemplate } from "../types";
import { Trans } from "@lingui/react/macro";
import * as Fm from "../freemarker/condition";
import { t } from "@lingui/core/macro";
import { createVariablesHelper } from "../email-vars";
import { createElement } from "react";

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

export const templateName = "Org Invite";

const { exp, v } = createVariablesHelper("org-invite.ftl");

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout preview={t`Here is a preview`} locale={locale}>
    <Text style={paragraph}>
      <Fm.If condition={`${v("firstName")}?? && ${v("lastName")}??`}>
        <p>
          <Trans>
            Hi, {exp("firstName")} {exp("lastName")}.
          </Trans>
        </p>
      </Fm.If>

      <Trans>
        <p>
          You were invited to join the {exp("organization.name")} organization. Click the
          link below to join.{" "}
        </p>
        <p>
          <a href={exp("link")}>Link to join the organization</a>
        </p>
        <p>
          This link will expire within {exp("linkExpirationFormatter(linkExpiration)")}.
        </p>
        <p>If you don't want to join the organization, just ignore this message.</p>
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
  return "Invitation to join the {0} organization";
};
