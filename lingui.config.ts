import { LinguiConfig } from '@lingui/conf'

const config = {
  locales: ['en', 'pseudo'],
  sourceLocale: 'en',
  pseudoLocale: 'pseudo',
  catalogs: [
    {
      path: '<rootDir>/emails/locales/{locale}',
      include: ['emails'],
    },
  ],
  runtimeConfigModule: {
    Trans: ['@/i18n/trans', 'Trans'],
  },
} satisfies LinguiConfig

export default config
