import { forwardRef, ReactNode, useImperativeHandle } from 'react'

const FakeModal = forwardRef(
  (
    {
      children,
      title,
      onClose,
    }: { title: string; children: ReactNode; onClose?: () => void },
    ref
  ) => {
    useImperativeHandle(ref, () => ({
      closeModal: onClose,
    }))

    return (
      <>
        <h2>{title}</h2>
        {children}
      </>
    )
  }
)
FakeModal.displayName = 'FakeModal'

export default FakeModal
