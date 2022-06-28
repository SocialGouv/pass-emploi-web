import FailureIcon from '../assets/icons/important_outline.svg'

import IconComponent, { IconName } from 'components/ui/IconComponent'

type FailureMessageProps = {
  label: string
  onAcknowledge?: () => void
}

export default function FailureMessage({
  label,
  onAcknowledge,
}: FailureMessageProps) {
  return (
    <div
      role='alert'
      className='text-warning bg-warning_lighten p-6 flex items-center rounded-medium mb-8'
    >
      <FailureIcon
        aria-hidden={true}
        focusable={false}
        className='w-6 h-6 mr-2 shrink-0'
      />
      <p className='grow'>{label}</p>
      {onAcknowledge && (
        <button
          aria-label="J'ai compris"
          onClick={onAcknowledge}
          className='border-none shrink-0'
        >
          <IconComponent
            name={IconName.Close}
            focusable='false'
            aria-hidden='true'
            className='h-6 w-6 fill-warning'
          />
        </button>
      )}
    </div>
  )
}
