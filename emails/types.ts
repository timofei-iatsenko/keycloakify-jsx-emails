export type GetTemplateProps = {
  locale: string;
  themeName: string;
  plainText: boolean;
};

export type GetTemplate = (props: GetTemplateProps) => Promise<string>;
export type GetSubject = (props: {
  locale: string;
  themeName: string;
}) => Promise<string>;
export type GetMessages = (props: {
  locale: string;
  themeName: string;
}) => Record<string, string>;
export type EmailTemplateModule = {
  getTemplate: GetTemplate;
  getSubject: GetSubject;
};
