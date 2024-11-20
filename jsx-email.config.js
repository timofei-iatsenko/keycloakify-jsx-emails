import { defineConfig } from 'jsx-email/config'
import { pluginLinguiMacro } from './esbuildPluginLinguiMacro.js'

export const config = defineConfig({
  esbuild: {
    plugins: [pluginLinguiMacro()],
  },
})
