import vgwMultibrandFeConfig from '@vgw/eslint-config-multibrand-fe'
import linguiPlugin from 'eslint-plugin-lingui'

export default [
  ...vgwMultibrandFeConfig,
  {
    ignores: ['public/**', '**/locales/*.ts'],
  },

  {
    ...linguiPlugin.configs['flat/recommended'],

    files: ['emails/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'react/no-unescaped-entities': 'off',

      'lingui/no-expression-in-message': 'off',
      'lingui/no-unlocalized-strings': [
        'warn',
        {
          ignore: [
            // Ignore strings that don’t start with an uppercase letter
            //   or don't contain two words separated by whitespace
            '^(?![A-Z].*|\\w+\\s\\w+).+$',
            // Ignore UPPERCASE literals
            // Example: const test = "FOO"
            '^[A-Z0-9_-]+$',
          ],
          ignoreNames: [
            // Ignore matching className (case-insensitive)
            { regex: { pattern: 'className', flags: 'i' } },
            // Ignore UPPERCASE names
            // Example: test.FOO = "ola!"
            { regex: { pattern: '^[A-Z0-9_-]+$' } },
            'styleName',
            'src',
            'srcSet',
            'type',
            'id',
            'width',
            'height',
            'displayName',
            'templateName',
          ],
          ignoreFunctions: [
            //
            'cva',
            'cn',
            'track',
            'Error',
            'console.*',
          ],
        },
      ],
    },
  },
]
