import { ReactElement } from 'react'

type ElementOnly = ReactElement | null | undefined
export type ElementsOnly = ElementOnly | Iterable<ElementOnly>
