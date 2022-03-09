import CloseIcon from '../assets/icons/close.svg'
import SuccessIcon from '../assets/icons/done.svg'

type SuccessMessageProps = {
  label: string
  onAcknowledge?: () => void
}

export default function SuccessMessage({
  label,
  onAcknowledge,
}: SuccessMessageProps) {
  return (
    <div className='text-success bg-success_lighten p-6 flex items-center rounded-medium mb-8'>
      <SuccessIcon
        aria-hidden={true}
        focusable={false}
        className='w-6 h-6 mr-2'
      />
      <p className='grow'>{label}</p>
      {onAcknowledge && (
        <button aria-label="J'ai compris" onClick={onAcknowledge}>
          <CloseIcon
            focusable='false'
            aria-hidden='true'
            className='fill-success'
          />
        </button>
      )}
    </div>
  )
}
