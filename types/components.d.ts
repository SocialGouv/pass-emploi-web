import { ReactNode } from 'react'

export type MandatoryNode = Exclude<ReactNode, undefined | null>
