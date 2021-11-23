import { useRouter } from 'next/router'
import { useState } from 'react'
import CloseIcon from '../assets/icons/close_modal.svg'

type SuccessMessageProps = {
  isSuccess: boolean
  redirectionUrl: string
  label: string
}

const SuccessMessage = ({
  isSuccess,
  redirectionUrl,
  label,
}: SuccessMessageProps) => {
  const router = useRouter()
  const [displaySuccessMessage, setDisplaySuccessMessage] = useState(isSuccess)

  const handleCloseMessage = () => {
    setDisplaySuccessMessage(false)
    router.push(
      {
        pathname: redirectionUrl,
      },
      undefined,
      { shallow: true }
    )
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
