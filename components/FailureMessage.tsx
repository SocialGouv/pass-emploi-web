import CloseIcon from '../assets/icons/close.svg'
import FailureIcon from '../assets/icons/important_outline.svg'

type FailureMessageProps = {
  label: string
  alert?: boolean
  onAcknowledge?: () => void
}

export default function FailureMessage({
  label,
  alert = true,
  onAcknowledge,
}: FailureMessageProps) {
  return (
    <div
      role={`${alert ? 'alert' : 'undefined'}`}
      className='text-warning bg-warning_lighten p-6 flex items-center rounded-medium mb-8'
    >
      <FailureIcon
        aria-hidden={true}
        focusable={false}
        className='w-6 h-6 mr-2'
      />
      <p className='grow'>{label}</p>
      {onAcknowledge && (
        <button
          aria-label="J'ai compris"
          onClick={onAcknowledge}
          className='border-none'
        >
          <CloseIcon
            focusable='false'
            aria-hidden='true'
            className='fill-warning'
          />
        </button>
      )}
    </div>
  )
}
