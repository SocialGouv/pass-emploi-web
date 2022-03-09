import CloseIcon from '../assets/icons/close.svg'

type DeprecatedSuccessMessageProps = {
  label: string
  onAcknowledge: () => void
}

const DeprecatedSuccessMessage = ({
  label,
  onAcknowledge,
}: DeprecatedSuccessMessageProps) => {
  return (
    <div className='p-4 flex justify-between items-center bg-bleu_blanc mb-2 border-t-2 border-bleu_nuit'>
      <p className='text-sm-semi ml-4'>{label}</p>
      <button aria-label="J'ai compris" onClick={onAcknowledge}>
        <CloseIcon focusable='false' aria-hidden='true' />
      </button>
    </div>
  )
}

export default DeprecatedSuccessMessage
