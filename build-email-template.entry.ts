#!/usr/bin/env -S node --import @swc-node/register/esm-register

import { buildEmailTheme } from "./build-email-template";
import themes from "./themes";

const { config: loadConfig } = await import("./jsx-email.config.js");

const config = await loadConfig;

await buildEmailTheme({
  templatesSrcDirPath: import.meta.dirname + "/emails/templates",
  i18nSourceFile: import.meta.dirname + "/emails/i18n.ts",
  themeNames: themes,
  keycloakifyBuildDirPath: "dist_emails",
  locales: ["en", "pl"],
  esbuild: config.esbuild,
  cwd: import.meta.dirname,
});
