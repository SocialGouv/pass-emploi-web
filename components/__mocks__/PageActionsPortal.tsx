import { ReactNode } from 'react'

export default function FakePortal(props: { children: ReactNode }) {
  return <>{props.children}</>
}
