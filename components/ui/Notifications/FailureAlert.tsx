import { ReactNode } from 'react'

import FailureIcon from 'assets/icons/informations/info.svg'
import IconComponent, { IconName } from 'components/ui/IconComponent'

type FailureMessageProps = {
  label: string
  onAcknowledge?: () => void
  shouldFocus?: boolean
  children?: ReactNode
}

export default function FailureAlert({
  label,
  onAcknowledge,
  shouldFocus,
  children,
}: FailureMessageProps) {
  return (
    <div
      role='alert'
      className='text-warning bg-warning_lighten p-6 flex flex-col rounded-base mb-8'
      ref={shouldFocus ? (e) => e?.focus() : undefined}
      tabIndex={shouldFocus ? -1 : undefined}
    >
      <div className='flex'>
        <FailureIcon
          aria-hidden={true}
          focusable={false}
          className='w-6 h-6 mr-2 fill-warning shrink-0'
        />
        <p className='text-base-bold grow'>{label}</p>
        {onAcknowledge && (
          <button
            aria-label="J'ai compris"
            onClick={onAcknowledge}
            className='border-none shrink-0'
          >
            <IconComponent
              name={IconName.Close}
              focusable={false}
              aria-hidden={true}
              className='h-6 w-6 fill-warning'
            />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}
