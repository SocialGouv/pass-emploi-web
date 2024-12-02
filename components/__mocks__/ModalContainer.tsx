import { ForwardedRef, forwardRef, useImperativeHandle } from 'react'

import { ModalContainerProps, ModalHandles } from 'components/ModalContainer'

function FakeModalContainer(
  { children, onClose }: ModalContainerProps,
  ref: ForwardedRef<ModalHandles>
) {
  useImperativeHandle(ref, () => ({
    focusClose: () => {},
    closeModal: onClose,
  }))

  return <>{children}</>
}

export default forwardRef(FakeModalContainer)
