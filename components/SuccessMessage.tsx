import { useState } from 'react'
import CloseIcon from '../assets/icons/close_modal.svg'

type SuccessMessageProps = {
  shouldDisplay: boolean
  label: string
  onAcknowledge: () => void
}

const SuccessMessage = ({
  shouldDisplay,
  label,
  onAcknowledge,
}: SuccessMessageProps) => {
  const [displaySuccessMessage, setDisplaySuccessMessage] =
    useState(shouldDisplay)

  const handleCloseMessage = () => {
    setDisplaySuccessMessage(false)
    onAcknowledge()
  }

  return (
    <>
      {displaySuccessMessage && (
        <div className='flex justify-between items-center bg-bleu_blanc mb-2'>
          <p className='text-sm-semi ml-4'>{label}</p>
          <button aria-label="J'ai compris" onClick={handleCloseMessage}>
            <CloseIcon focusable='false' aria-hidden='true' />
          </button>
        </div>
      )}
    </>
  )
}

export default SuccessMessage
