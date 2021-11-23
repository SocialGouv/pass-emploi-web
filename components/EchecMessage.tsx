import { useState } from 'react'
import CloseIcon from '../assets/icons/close_modal.svg'

type EchecMessageProps = {
  deleteEchec: boolean
  label: string
}

const EchecMessage = ({ deleteEchec, label }: EchecMessageProps) => {
  const [displayDeleteEchecMessage, setDisplayDeleteEchecMessage] =
    useState(deleteEchec)

  const handleCloseMessage = () => {
    setDisplayDeleteEchecMessage(false)
  }

  return (
    <>
      {displayDeleteEchecMessage && (
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
