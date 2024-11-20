import { createContext } from 'jsx-email'
import { I18n } from '@lingui/core'

export const LinguiContext = createContext<{ i18n: I18n } | undefined>(
  undefined,
)
