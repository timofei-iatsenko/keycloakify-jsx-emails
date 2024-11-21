<p align="center">
    <i>🚀 <a href="https://keycloakify.dev">Keycloakify</a> v11 starter with JSX Emails and Lingui</i>
</p>


## How emails works in the Keycloak

Keyclock is sending a multipart emails with HTML and PlainText simultaneously for better compatibility. 
For that reason in the theme folder there ire `html/*.ftl` and `text/.*.ftl` templates. 

Mostly every template has a very simple structure, where there minimum markup and one call to `msg` i18n function. 

```ftl
<#import "template.ftl" as layout>
  <@layout.emailLayout>
  ${kcSanitize(msg("identityProviderLinkBodyHtml", identityProviderDisplayName, realmName, identityProviderContext.username, link, linkExpiration, linkExpirationFormatter(linkExpiration)))?no_esc}
</@layout.emailLayout>
```

The value for the `identityProviderLinkBodyHtml` message defined in the message bundle:

```properties
# src/email/messages/messages_en.properties

identityProviderLinkBody=Someone wants to link your "{1}" account with "{0}" account of user {2} . If this was you, click the link below to link accounts\n\n{3}\n\nThis link will expire within {5}.\n\nIf you don''t want to link account, just ignore this message. If you link accounts, you will be able to login to {1} through {0}.
identityProviderLinkBodyHtml=<p>Someone wants to link your <b>{1}</b> account with <b>{0}</b> account of user {2}. If this was you, click the link below to link accounts</p><p><a href="{3}">Link to confirm account linking</a></p><p>This link will expire within {5}.</p><p>If you don''t want to link account, just ignore this message. If you link accounts, you will be able to login to {1} through {0}.</p>
```
There are two entries for each email template, one for the plain text one for the html. And as you can see there is the same content but one with the markup and onther is not. 

This is suboptimal, because 
 - all markup is inside the translations and tightly coupled to it. imagine you want to add inline styles to those `<p>` element. So every change to markup should be ported to all languages.
 - There is a copy paste of message content between plainText and html

I will refer to this points later with a soultions.

## How email templates are done in KeyCloackify
You need to use 

```bash
npx keycloakify initialize-email-theme
```

command, which will create `/src/email` folder with all existing `ftl` templates. 
Docs says you can remove templates you are not going to override, so we can have there only those templates we are going to style. 

## How jsx-email integration works

The Keycloak server obviously cannot execute JS and therefore our JSX templates. 
Instead we use a pre-generation and compile our JSX templates into plain old html files.

This repo contain a script called `build-emails.ts` which is taking JSX templates from `./emails/templates` folder
compile TS and JSX and then render the markup into Keycloakify `src/email/` folder. 

The script is doing 2 passes, one got the html, and second is for plain text, so we don't need to mainatain 2 versions manually

```ts
const html = await render(createElement(Template, { themeName, locale }), {
  pretty: true,
});

const plainText = await render(createElement(Template, { themeName, locale }), {
  plainText: true,
  pretty: true,
});
```

The jsx-email library is smart enoughh to correctly render known elements as plain text, for example: 

```jsx
// input jsx
<p>
  <a href={exp('link')}>Link to e-mail address verification</a>
</p>
```

Html: 
```html
<p><a href="${kcSanitize(link)?no_esc}">Link to e-mail address verification</a></p>
```

Plain Text:
```
Link to e-mail address verification ${kcSanitize(link)?no_esc}
```

As you can see, it kept the link, so functionality is preserved. 

### Theming and I18N variants

Because Keycloak is not going to execute our JSX, we need to pregenerate every version of our 
templates and point keycloack to the correct one. For that build script generates an "entry-point" file which looks like that:

```ftl
<#switch locale>
<#case "pseudo">
    <#include "./" + xKeycloakify.themeName + "/pseudo/email-verification.ftl">
    <#break>
  <#default>
    <#include "./" + xKeycloakify.themeName + "/en/email-verification.ftl">  
</#switch>
```

The script generates templates for the `[locale, theme]` parameters matrix and stores them in the separate folders `/html/{themeName}/{locale}/templateName.ftl`

Then the `entrypoint` file picks correct version based on the `locale` and `xKeycloakify.themeName` variables available in the template. 

#### JSX Side

Every JSX template receive props:

```typescript
export type EmailTemplateProps = {
  locale: string;
  themeName: string;
};
```

So it's up to developer how to implement i18n or do a branching for the theme.

### I18n

Keycloack's way to i18n has many limitations which i described them above and it doesn't play well with a JSX-emails.

For example if i want to style  text, i have to use a `Text` component instead of `p`. `Text` component will give me a cross-platform styling, layouting and so on. 

So using messages from the Keacoack's theme message bundle is not the way to go. I wanted to have JSX-based i18n solution. 

However user can choose whatever solution for the i18n which suits his needs, i decided to use a Lingui. 

- Beacuse it gives a JSX-First appoach with a `Trans` tag
- it has tooling for extraction messages
- and no less important - i'm the core maintainer of the Lingui project

With a Lingui the email template is looks like that: 

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

And it gives me the full functionality of JSX with little developer overhead for i18n. 

### Freemarker Templates interopability

Our JSX templates is not going to resolve the placeholders for the username or link to real values. For those we need to teach Keycloack server to execute a JS. 
Instead we put a freemarker expressions which would be executed by keycloack on message send. 

I created few simple helpers to write such expressions: 

```ts
const { exp } = createVariablesHelper('email-verification.ftl')
```

Create a **typed** helper for the particulare email template, so the name of freemarker variables is typesafe:

```ts
exp('realmName'); // Ok!
exp('randomName'); // Type Error!
```

You can check `email-vars.ts` file, to see what variables is supported and how it's implemented.

I also created a helpers for the freemarker conditions: 

```tsx
<Fm.If condition={`${v('firstName')}?? && ${v('lastName')}??`}>
  <p>
    <Trans>
      Hi, {exp('firstName')} {exp('lastName')}.
    </Trans>
  </p>
</Fm.If>
```

So user can write conditions with a full type safety and without messing with freemarker syntax inside the JSX text.

# Usage guide for emails theming

## To create a new template

Just create a `tsx` file in the `emails/templates`. The module should exports `Template` JSX element. 

## Commands
- `pnpm emails:build` - build JSX templates into freemarker templates in the `src/email/` folder
- `pnpm emails:preview` - opens the [preview server](https://jsx.email/docs/core/cli#preview) for the emails, where you can iterate your template, send it to yourself, see preview of plain text and so on. 
- `pnpm emails:check` - will check your templates against [caniemail](https://www.caniemail.com/) database and show hints. 

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
