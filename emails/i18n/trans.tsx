import { TransNoContext } from '@lingui/react/server'
import { TransProps } from '@lingui/react'
import { useContext } from 'jsx-email'
import { LinguiContext } from './lingui-context'

/**
 * This component used as a runtime by lingui macro. It's defined in the lingui.config.ts
 */

export function Trans(props: TransProps) {
  const ctx = useContext(LinguiContext)
  if (!ctx) {
    throw new Error(
      "You tried to use `Trans` in emails, but haven't wrap your react tree with a LinguiEmailProvider",
    )
  }
  return <TransNoContext {...props} lingui={ctx} />
}
