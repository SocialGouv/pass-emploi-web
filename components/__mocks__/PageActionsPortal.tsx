import { ReactNode } from 'react'

export default function FakePortal(props: { children: ReactNode }) {
  return <div data-testid='page-action-portal'>{props.children}</div>
}
