#!/usr/bin/env -S node --import @swc-node/register/esm-register

import { promises as fs } from "node:fs";
import path from "node:path";
import linguiConfig from "./lingui.config";
import * as esbuild from "esbuild";
import { EmailTemplateModule, GetMessages } from "./emails/types";
import * as propertiesParser from "properties-parser";

const jsxTemplatesDir = "./emails/templates";
const keyCloakTemplatesDir = "./dist_emails";
const esbuildOutDir = "./__dist-emails";
const i18nSourceFile = "./emails/i18n.ts";

const locales = linguiConfig.locales;

type EmailTemplateModuleWithPath = EmailTemplateModule & { file: string };
type I18nModule = { getMessages: GetMessages };

/**
 *
 * @param {string} dirPath
 */
async function getTemplates(dirPath: string) {
  try {
    // Read all items in the directory
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    // Filter out only files
    const files = items
      .filter((item) => item.isFile())
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

  // todo: validate that i18nSourceFile file exists and throw error
  // or make it optional?
  await bundle([...tpls, i18nSourceFile]);

  console.log(`Discovered templates:`);
  const promises = tpls.map(async (file) => {
    const module = await (import(
      path.join(
        import.meta.dirname,
        esbuildOutDir,
        // todo: esbuild change the dist structure based on a common ancestor
        "templates/" + getBaseName(file) + ".js",
      )
    ) as Promise<EmailTemplateModule>);

    if (!module.getTemplate) {
      throw new Error(`File ${file} does not have an exported function getTemplate`);
    }

    if (!module.getSubject) {
      throw new Error(`File ${file} does not have an exported function getSubject`);
    }

    console.log(`- ${file}`);

    return { ...module, file } as EmailTemplateModuleWithPath;
  });

  const i18nFileModule = await (import(
    path.join(import.meta.dirname, esbuildOutDir, getBaseName(i18nSourceFile) + ".js")
  ) as Promise<I18nModule>);

  if (!i18nFileModule.getMessages) {
    throw new Error(
      `File ${i18nSourceFile} does not have an exported function getMessages`,
    );
  }

  const modules = await Promise.all(promises);

  for (const themeName of themes) {
    // i'm intentionally doing this sequentially to avoid
    // concurrency during templates rendering
    await renderTheme(themeName, modules, i18nFileModule);
  }

  await fs.rm(esbuildOutDir, {
    recursive: true,
    force: true,
  });

  console.log("Done! 🚀");
}

main();

function toCamelCase(str: string) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

async function renderTheme(
  themeName: string,
  templates: EmailTemplateModuleWithPath[],
  i18nModule: I18nModule,
) {
  const emailThemeFolder = path.join(keyCloakTemplatesDir, themeName, "email");

  for (const mod of templates) {
    await renderTemplate(mod, themeName, emailThemeFolder);
  }

  for (const locale of locales) {
    const messages: Record<string, string> = i18nModule.getMessages({
      locale,
      themeName,
    });

    for (const mod of templates) {
      messages[toCamelCase(getBaseName(mod.file)) + "Subject"] = await mod.getSubject({
        locale,
        themeName,
      });
    }

    await writePropertiesFile(
      path.join(emailThemeFolder, "messages"),
      `messages_${locale}.properties`,
      messages,
    );
  }

  await writePropertiesFile(emailThemeFolder, "theme.properties", {
    parent: "base",
    locales: locales.join(","),
  });
}

async function renderTemplate(
  mod: EmailTemplateModuleWithPath,
  themeName: string,
  emailThemeFolder: string,
) {
  const ftlName = getBaseName(mod.file) + ".ftl";
  const entryPointContent = `<#include "./" + locale + "/${ftlName}">`;

  // write ftl html entrypoint
  await writeFile(path.join(emailThemeFolder, "html"), ftlName, entryPointContent);

  // write ftl text entrypoint
  await writeFile(path.join(emailThemeFolder, "text"), ftlName, entryPointContent);

  for (const locale of locales) {
    for (const type of ["html", "text"] as const) {
      const html = await mod.getTemplate({
        themeName,
        locale,
        plainText: type === "text",
      });

      // write ftl file
      await writeFile(path.join(emailThemeFolder, type, locale), ftlName, html);
    }
  }
}

async function writeFile(filePath: string, filename: string, content: string) {
  await fs.mkdir(filePath, { recursive: true });
  await fs.writeFile(path.join(filePath, filename), content);
}

async function writePropertiesFile(
  path: string,
  filename: string,
  properties: Record<string, string>,
) {
  const editor = propertiesParser.createEditor();
  for (const [key, value] of Object.entries(properties)) {
    editor.set(key, value);
  }

  await writeFile(path, filename, editor.toString());
}
/**
 * get a basename (filename) from a pth without an extension
 * @param filePath
 */
function getBaseName(filePath: string) {
  return path.basename(filePath, path.extname(filePath));
}
