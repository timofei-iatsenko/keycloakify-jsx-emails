import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";
import themes from "./themes";
import { buildEmailTheme } from "./build-email-template";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    keycloakify({
      themeName: themes,
      accountThemeImplementation: "none",
      postBuild: async (buildContext) => {
        // Assume that config of esbuild would be overridable via keycloackify settings
        // similarly to how it's configurable in jsx-email
        // when this code would be incorporated into keycloackify jsx-email config
        // shouldn't be there, because we want a framework-agnostic solution
        const { config: loadConfig } = await import("./jsx-email.config.js");

        const config = await loadConfig;

        await buildEmailTheme({
          templatesSrcDirPath: import.meta.dirname + "/emails/templates",
          i18nSourceFile: import.meta.dirname + "/emails/i18n.ts",
          themeNames: buildContext.themeNames,
          keycloakifyBuildDirPath: buildContext.keycloakifyBuildDirPath,
          locales: ["en", "pl"],
          esbuild: config.esbuild,
          cwd: import.meta.dirname,
        });
      },
    }),
  ],
});
