import { ReactElement } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface SuccessMessageProps {
  label: string
  children?: ReactElement
  onAcknowledge?: () => void
}

export default function SuccessMessage({
  label,
  onAcknowledge,
  children,
}: SuccessMessageProps) {
  return (
    <div className='flex-col items-center text-success bg-success_lighten p-6 rounded-medium mb-8'>
      <div className='flex justify-between'>
        <div className='flex items-center'>
          <IconComponent
            name={IconName.CheckRounded}
            aria-hidden={true}
            focusable={false}
            className='w-6 h-6 mr-2'
          />
          <p className='text-base-medium'>{label}</p>
        </div>
        {onAcknowledge && (
          <button
            aria-label="J'ai compris"
            onClick={onAcknowledge}
            className='border-none'
          >
            <IconComponent
              name={IconName.Close}
              focusable='false'
              aria-hidden='true'
              className='h-6 w-6 fill-success'
            />
          </button>
        )}
      </div>
      {children && <div className='mt-2'>{children}</div>}
    </div>
  )
}
