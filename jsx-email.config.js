import { defineConfig } from "jsx-email/config";
import { pluginLinguiMacro } from "esbuild-plugin-lingui-macro";

export const config = defineConfig({
  esbuild: {
    plugins: [
      pluginLinguiMacro({
        babelPluginOptions: {
          stripMessageField: false,
        },
      }),
    ],
  },
});
