<p align="center">
    <i>🚀 <a href="https://keycloakify.dev">Keycloakify</a> v11 starter with JSX Emails and Lingui</i>
</p>


# Keycloak Email Workflow

## How Emails Work in Keycloak

Keycloak sends **multipart emails** containing both HTML and plain text versions simultaneously to ensure better compatibility across email clients. Email templates are stored in the theme folder under two directories: `html/*.ftl` for HTML templates and `text/*.ftl` for plain text ones.

Most templates have a simple structure with minimal markup and a call to the `msg` internationalization function. Here’s an example:

```ftl
<#import "template.ftl" as layout>
<@layout.emailLayout>
  ${kcSanitize(msg("identityProviderLinkBodyHtml", identityProviderDisplayName, realmName, identityProviderContext.username, link, linkExpiration, linkExpirationFormatter(linkExpiration)))?no_esc}
</@layout.emailLayout>
```

The `identityProviderLinkBodyHtml` message is defined in the message bundle as follows:

```properties
# src/email/messages/messages_en.properties

identityProviderLinkBody=Someone wants to link your "{1}" account with "{0}" account of user {2} . If this was you, click the link below to link accounts\n\n{3}\n\nThis link will expire within {5}.\n\nIf you don''t want to link account, just ignore this message. If you link accounts, you will be able to login to {1} through {0}.
identityProviderLinkBodyHtml=<p>Someone wants to link your <b>{1}</b> account with <b>{0}</b> account of user {2}. If this was you, click the link below to link accounts</p><p><a href="{3}">Link to confirm account linking</a></p><p>This link will expire within {5}.</p><p>If you don''t want to link account, just ignore this message. If you link accounts, you will be able to login to {1} through {0}.</p>
```

Each email template requires two entries: one for plain text and another for HTML. The content is identical except for the markup, which leads to the following issues:

1. **Markup duplication**: Styling, such as adding inline styles, must be updated across all language-specific versions of the HTML template.
2. **Content duplication**: Plain text and HTML templates duplicate the same content, requiring manual synchronization.

These limitations is adressed in this integration and will be covered later in this document.

## Email Templates in Keycloakify

To start working on the email themes you need run the following command:

```bash
npx keycloakify initialize-email-theme
```

This creates a `/src/email` folder containing html and plain text templates `.ftl` for all known emails. You can remove templates that you don’t plan to override, keeping only those you intend to customize.

## How jsx-email integration works

Since Keycloak server cannot execute JavaScript, we pre-generate email templates as HTML and write them into corresponding folders.

The repository includes a `build-emails.ts` script that:
1. **Compiles TypeScript and JSX templates** located in `./emails/templates`.
2. **Renders the templates** into the Keycloakify `src/email/` folder.

### Dual Pass Rendering
The script renders both HTML and plain text in separate passes, eliminating the need to manually maintain two versions:

```ts
const html = await render(createElement(Template, { themeName, locale }), { pretty: true });
const plainText = await render(createElement(Template, { themeName, locale }), { plainText: true, pretty: true });
```

The `jsx-email` library intelligently handles plain text rendering. For example:

```jsx
// Input JSX
<p>
  <a href={exp('link')}>Link to verify your email</a>
</p>
```

Outputs:

- **HTML**:
  ```html
  <p><a href="${kcSanitize(link)?no_esc}">Link to verify your email</a></p>
  ```
- **Plain Text**:
  ```
  Link to verify your email ${kcSanitize(link)?no_esc}
  ```

As you can see, it kept the link, so functionality is preserved.

## Theming and I18N Variants

Since Keycloak doesn’t execute JSX, the build script pre-generates all `[locale, theme]` combinations. Templates are stored in `/html/{themeName}/{locale}/{templateName}.ftl`.

The script generates an  entry-point file to select the appropriate template based on the `locale` and `xKeycloakify.themeName` variables:

```ftl
<#switch locale>
  <#case "pseudo">
    <#include "./" + xKeycloakify.themeName + "/pseudo/email-verification.ftl">
    <#break>
  <#default>
    <#include "./" + xKeycloakify.themeName + "/en/email-verification.ftl">
</#switch>
```

### JSX Props

Each JSX template receives the following props:

```typescript
export type EmailTemplateProps = {
  locale: string;
  themeName: string;
};
```

This allows developers to implement their own internationalization or theme-specific logic.

## Internationalization (I18N)

Keycloak's I18N mechanism has limitations:
- Markup must be embedded in translation strings, making it not possible to use JSX-Emails components.

To address this, I use Lingui, a **JSX-first** internationalization library offering:
- The `<Trans>` component for inline translation.
- Tools for message extraction.
- Robust integration with JSX.

Here’s an example template using Lingui:

```tsx
const { exp } = createVariablesHelper('email-verification.ftl')

export const Template = ({ locale }: EmailTemplateProps) => (
  <EmailLayout preview={t`Here is a preview`} locale={locale}>
    <Text style={paragraph}>
      <Trans>
        <Text>
          Someone has created a {exp('realmName')} account with this email
          address. If this was you, click the link below to verify your email
          address
        </Text>
        <Text>
          <a href={exp('link')}>Link to e-mail address verification</a>
        </Text>
        <Text>
          This link will expire within{' '}
          {exp('linkExpirationFormatter(linkExpiration)')}.
        </Text>
        <Text>If you didn't create this account, just ignore this message.</Text>
      </Trans>
    </Text>
  </EmailLayout>
)
```

## Freemarker Template Interoperability

JSX templates use placeholders for variables like `username` or `link`. These placeholders are replaced by Keycloak’s Freemarker engine during email generation.

I created few helpers to write **type-safe** freeemarker expressions:

```ts
const { exp } = createVariablesHelper('email-verification.ftl');
exp('realmName'); // Valid
exp('unknownName'); // Type Error
```

You can check `email-vars.ts` file, to see what variables are supported and how it's implemented.

Conditional rendering in Freemarker can also be expressed using `If` component:

```tsx
<Fm.If condition={`${v('firstName')}?? && ${v('lastName')}??`}>
  <p>
    <Trans>
      Hi, {exp('firstName')} {exp('lastName')}.
    </Trans>
  </p>
</Fm.If>
```


## Email Theming Usage Guide

### Creating a New Template
1. Add a new `.tsx` file to the `emails/templates` folder.
2. Export a `Template` JSX component from the file.

### Available Commands
- **`pnpm emails:build`**: Compiles JSX templates into Freemarker files in the `src/email/` folder.
- **`pnpm emails:preview`**: Opens a  [preview server](https://jsx.email/docs/core/cli#preview) to test, iterate, and send templates.
- **`pnpm emails:check`**: Validates templates against [Can I Email](https://www.caniemail.com/).


# Starter Docs

This starter is based on Vite. There is also [a Webpack based starter](https://github.com/keycloakify/keycloakify-starter-webpack).

# Quick start

```bash
git clone https://github.com/keycloakify/keycloakify-starter
cd keycloakify-starter
yarn install # Or use an other package manager, just be sure to delete the yarn.lock if you use another package manager.
```

# Testing the theme locally

[Documentation](https://docs.keycloakify.dev/v/v10/testing-your-theme)

# How to customize the theme

[Documentation](https://docs.keycloakify.dev/v/v10/customization-strategies)

# Building the theme

You need to have [Maven](https://maven.apache.org/) installed to build the theme (Maven >= 3.1.1, Java >= 7).  
The `mvn` command must be in the $PATH.

-   On macOS: `brew install maven`
-   On Debian/Ubuntu: `sudo apt-get install maven`
-   On Windows: `choco install openjdk` and `choco install maven` (Or download from [here](https://maven.apache.org/download.cgi))

```bash
npm run build-keycloak-theme
```

Note that by default Keycloakify generates multiple .jar files for different versions of Keycloak.  
You can customize this behavior, see documentation [here](https://docs.keycloakify.dev/targeting-specific-keycloak-versions).

# Initializing the account theme

```bash
npx keycloakify initialize-account-theme
```

# Initializing the email theme

```bash
npx keycloakify initialize-email-theme
```

# GitHub Actions

The starter comes with a generic GitHub Actions workflow that builds the theme and publishes
the jars [as GitHub releases artifacts](https://github.com/keycloakify/keycloakify-starter/releases/tag/v10.0.0).  
To release a new version **just update the `package.json` version and push**.

To enable the workflow go to your fork of this repository on GitHub then navigate to:
`Settings` > `Actions` > `Workflow permissions`, select `Read and write permissions`.
