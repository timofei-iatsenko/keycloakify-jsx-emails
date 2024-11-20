#!/usr/bin/env -S node --import @swc-node/register/esm-register

/* eslint-disable no-console */
import { render } from "jsx-email";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createElement, FunctionComponent } from "react";
import linguiConfig from "./lingui.config";
import * as esbuild from "esbuild";

const jsxTemplatesDir = "./emails/templates";
const keyCloakTemplatesDir = "./src/email";
const esbuildOutDir = "./dist-emails";

const locales = linguiConfig.locales;
const sourceLocale = linguiConfig.sourceLocale;

type EmailTemplateFactory = FunctionComponent<{
  themeName: string;
  locale: string;
}>;
/**
 *
 * @param {string} dirPath
 */
async function getTemplates(dirPath: string) {
  try {
    // Read all items in the directory
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    // Filter out only files and not starting from "_"
    const files = items
      .filter((item) => item.isFile() && !getBaseName(item.name).startsWith("_"))
      .map((file) => path.join(dirPath, file.name));

    return files;
  } catch (err) {
    console.error(`Error scanning directory: ${(err as Error).message}`);
    throw err;
  }
}

async function getThemes() {
  const { default: themes } = await import("./themes");

  return themes;
}

async function bundle(entryPoints: string[]) {
  const { config: loadConfig } = await import("./jsx-email.config.js");

  const config = await loadConfig;

  await esbuild.build({
    entryPoints: entryPoints,
    bundle: true,
    outdir: esbuildOutDir,
    platform: "node",
    sourcemap: true,
    packages: "external",
    format: "esm",
    target: "node20",
    ...config.esbuild,
  });
}

export async function main() {
  const themes = await getThemes();
  console.log(`Build emails for ${themes.join(", ")} themes`);

  const tpls = await getTemplates(jsxTemplatesDir);

  await bundle(tpls);

  console.log(import.meta.dirname);
  const promises = tpls.map(async (file) => {
    const module = await (import(
      path.join(import.meta.dirname, esbuildOutDir, getBaseName(file) + ".js")
    ) as Promise<{
      Template: EmailTemplateFactory;
    }>);

    if (!module.Template) {
      throw new Error(`File ${file} does not have an exported name Template`);
    }

    console.log(`Rendering ${file}`);
    await renderTemplate(module.Template, file, themes);
  });

  await Promise.all(promises);

  await fs.rm(esbuildOutDir, {
    recursive: true,
    force: true,
  });

  console.log("Done! 🚀");
}

main();

function buildFtlEntryPoint(templateName: string, locales: string[]) {
  // choose template based on locale, fallback to source locale if locale is not supported
  return `
<#switch locale>
${locales
  .filter((locale) => locale !== sourceLocale)
  .map((locale) =>
    `
  <#case "${locale}">
    <#include "./" + xKeycloakify.themeName + "/${locale}/${templateName}">
    <#break>
`.trim(),
  )
  .join("\n")}
  <#default>
    <#include "./" + xKeycloakify.themeName + "/${sourceLocale}/${templateName}">  
</#switch> 
`.trim();
}

async function renderTemplate(
  Template: EmailTemplateFactory,
  filePath: string,
  themes: string[],
) {
  const freemarkerName = getBaseName(filePath) + ".ftl";

  const entryPointContent = buildFtlEntryPoint(freemarkerName, locales);

  // write ftl html entrypoint
  await writeFile(
    path.join(keyCloakTemplatesDir, "html"),
    freemarkerName,
    entryPointContent,
  );

  // write ftl text entrypoint
  await writeFile(
    path.join(keyCloakTemplatesDir, "text"),
    freemarkerName,
    entryPointContent,
  );

  for (const locale of locales) {
    for (const themeName of themes) {
      const html = await render(createElement(Template, { themeName, locale }), {
        pretty: true,
      });

      const plainText = await render(createElement(Template, { themeName, locale }), {
        plainText: true,
        pretty: true,
      });

      // write html version for template
      await writeFile(
        path.join(keyCloakTemplatesDir, "html", themeName, locale),
        freemarkerName,
        html,
      );

      // write text version for template
      await writeFile(
        path.join(keyCloakTemplatesDir, "text", themeName, locale),
        freemarkerName,
        plainText,
      );
    }
  }
}

async function writeFile(filePath: string, filename: string, content: string) {
  await fs.mkdir(filePath, { recursive: true });
  await fs.writeFile(path.join(filePath, filename), content);
}

/**
 * get a basename (filename) from a pth without an extension
 * @param filePath
 */
function getBaseName(filePath: string) {
  return path.basename(filePath, path.extname(filePath));
}
