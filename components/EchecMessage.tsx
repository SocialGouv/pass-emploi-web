import { useState } from 'react'
import CloseIcon from '../assets/icons/close.svg'

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
        <div className='p-4 flex justify-between items-center bg-rouge_france_5 mb-2 border-t-2 border-rouge_france'>
          <p className='text-sm-semi text-rouge_france ml-4'>{label}</p>

          <button aria-label="J'ai compris" onClick={handleCloseMessage}>
            <CloseIcon focusable='false' aria-hidden='true' />
          </button>
        </div>
      )}
    </>
  )
}

export default EchecMessage
