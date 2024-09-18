import { ReactElement } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface SuccessMessageProps {
  label: string
  children?: ReactElement
  onAcknowledge?: () => void
}

export default function SuccessAlert({
  label,
  onAcknowledge,
  children,
}: SuccessMessageProps) {
  return (
    <div
      className='flex-col items-center text-success bg-success_lighten p-6 rounded-base mb-8'
      tabIndex={-1}
      ref={(e) => e?.focus()}
    >
      <div className='flex justify-between'>
        <div className='flex items-center'>
          <IconComponent
            name={IconName.CheckCircleFill}
            aria-hidden={true}
            focusable={false}
            className='w-6 h-6 self-start mr-2 shrink-0 fill-success'
          />
          <p className='text-base-bold'>{label}</p>
        </div>
        {onAcknowledge && (
          <button
            aria-label="J'ai compris"
            onClick={onAcknowledge}
            className='border-none'
          >
            <IconComponent
              name={IconName.Close}
              focusable={false}
              aria-hidden={true}
              className='h-6 w-6 fill-success shrink-0'
            />
          </button>
        )}
      </div>
      {children && <div className='mt-2'>{children}</div>}
    </div>
  )
}
