import { forwardRef, ReactNode } from 'react'

const FakeModal = forwardRef(
  ({ children, title }: { title: string; children: ReactNode }, _) => {
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
