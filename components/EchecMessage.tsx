import CloseIcon from '../assets/icons/close.svg'

type EchecMessageProps = {
  label: string
  onAcknowledge: () => void
}

const EchecMessage = ({ label, onAcknowledge }: EchecMessageProps) => {
  return (
    <div className='p-4 flex justify-between items-center bg-warning_lighten mb-2 border-t-2 border-warning'>
      <p className='text-sm-semi text-warning ml-4'>{label}</p>

      <button aria-label="J'ai compris" onClick={onAcknowledge}>
        <CloseIcon
          focusable='false'
          aria-hidden='true'
          className='fill-warning'
        />
      </button>
    </div>
  )
}

export default EchecMessage
