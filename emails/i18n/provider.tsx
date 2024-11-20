import { LinguiContext } from './lingui-context'
import { i18n } from '@lingui/core'
import { PropsWithChildren } from 'react'
import { messages as en } from '../locales/en'
import { messages as pseudo } from '../locales/en'

i18n.load({
  en,
  pseudo,
})

export const LinguiEmailProvider = ({
  locale,
  children,
}: PropsWithChildren<{ locale: string }>) => {
  i18n.activate(locale)

  return (
    <LinguiContext.Provider
      value={{ i18n /*_: i18n.t.bind(i18n), defaultComponent: undefined */ }}
    >
      {children}
    </LinguiContext.Provider>
  )
}
