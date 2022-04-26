import { forwardRef, ReactNode } from 'react'

const FakeModal = forwardRef((props: { children: ReactNode }, _) => {
  return <>{props.children}</>
})
FakeModal.displayName = 'FakeModal'

export default FakeModal
