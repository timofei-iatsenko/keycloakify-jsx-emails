import path from 'path'
import fs from 'fs'
import {
  babelRe,
  getBabelParserOptions,
} from '@lingui/cli/api/extractors/babel'
import { transformAsync } from '@babel/core'
import linguiMacroPlugin from '@lingui/babel-plugin-lingui-macro'
import { getConfig } from '@lingui/conf'

export const pluginLinguiMacro = (options) => ({
  name: 'linguiMacro',
  setup(build) {
    /**
     * @type {import("@lingui/conf").LinguiConfigNormalized}
     */
    const linguiConfig =
      options?.linguiConfig || getConfig({ skipValidation: true })
    build.onLoad({ filter: babelRe, namespace: '' }, async (args) => {
      const filename = path.relative(process.cwd(), args.path)

      const contents = await fs.promises.readFile(args.path, 'utf8')

      const hasMacroRe = /from ["']@lingui(\/.+)?\/macro["']/g

      if (!hasMacroRe.test(contents)) {
        // let esbuild process file as usual
        return undefined
      }

      const result = await transformAsync(contents, {
        babelrc: false,
        configFile: false,

        filename: filename,

        sourceMaps: 'inline',
        parserOpts: {
          plugins: getBabelParserOptions(
            filename,
            linguiConfig.extractorParserOptions,
          ),
        },

        plugins: [
          [
            linguiMacroPlugin,
            /**
             * @type {import("@lingui/babel-plugin-lingui-macro").LinguiPluginOpts}
             */
            {
              extract: true,
              linguiConfig,
            },
          ],
        ],
      })

      return { contents: result?.code, loader: 'tsx' }
    })
  },
})
