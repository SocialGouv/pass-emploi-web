import { ReactElement, ReactNode } from 'react'

export type MandatoryNode = Exclude<ReactNode, undefined | null>

type ElementOnly = ReactElement | null | undefined
export type ElementsOnly = ElementOnly | Iterable<ElementOnly>
