import {
  ForwardedRef,
  forwardRef,
  MouseEvent,
  ReactNode,
  useImperativeHandle,
} from 'react'

import { ModalHandles } from 'components/Modal'

function FakeModal(
  {
    children,
    title,
    onClose,
  }: {
    title: string
    children: ReactNode
    onClose: (e: KeyboardEvent | MouseEvent) => void
  },
  ref: ForwardedRef<ModalHandles>
) {
  useImperativeHandle(ref, () => ({
    focus: () => {},
    closeModal: onClose,
  }))

  return (
    <>
      <h2>{title}</h2>
      {children}
    </>
  )
}

export default forwardRef(FakeModal)
