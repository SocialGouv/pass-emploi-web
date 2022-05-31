import { forwardRef, ReactNode } from 'react'

const FakeModal = forwardRef((props: { children: ReactNode }, _) => {
  return <div data-testid='fake-modal'>{props.children}</div>
})
FakeModal.displayName = 'FakeModal'

export default FakeModal
