import { Text } from "jsx-email";
import { EmailLayout } from "../layout";
import { GetSubject, GetTemplate, GetTemplateProps } from "../types";
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

export const templateName = "Email Test";

const { exp } = createVariablesHelper("email-test.ftl");

export const Template = ({ locale }: TemplateProps) => (
  <EmailLayout preview={"Here is a preview"} locale={locale}>
    <Text style={paragraph}>This is a test message from {exp("realmName")}</Text>
  </EmailLayout>
);

export const getTemplate: GetTemplate = async (props) => {
  return await render(createElement(Template, props), props.plainText);
};

export const getSubject: GetSubject = async (_props) => {
  return "[KEYCLOAK] - SMTP test message";
};
