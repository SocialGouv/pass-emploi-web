import { ReactNode } from 'react'

type MandatoryNode = Exclude<ReactNode, undefined | null>
