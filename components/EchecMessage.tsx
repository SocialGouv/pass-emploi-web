import { useState } from 'react'
import CloseIcon from '../assets/icons/close_modal.svg'

type EchecMessageProps = {
  shouldDisplay: boolean
  label: string
}

const EchecMessage = ({ shouldDisplay, label }: EchecMessageProps) => {
  const [displayEchecMessage, setDisplayEchecMessage] = useState(shouldDisplay)

  const handleCloseMessage = () => {
    setDisplayEchecMessage(false)
  }

  return (
    <>
      {displayEchecMessage && (
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

export default EchecMessage
