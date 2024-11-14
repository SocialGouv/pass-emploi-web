import {
  ForwardedRef,
  forwardRef,
  MouseEvent,
  ReactNode,
  useImperativeHandle,
} from 'react'

import { ModalHandles } from 'components/Modal'

function FakeModalContainer(
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
    focusClose: () => {},
    closeModal: onClose,
  }))

  return <>{children}</>
}

export default forwardRef(FakeModalContainer)
