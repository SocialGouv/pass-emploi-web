import React, { ReactNode } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface InformationMessageProps {
  label: string
  iconName?: IconName
  children?: ReactNode
  onAcknowledge?: () => void
}

export default function InformationMessage({
  label,
  iconName,
  children,
  onAcknowledge,
}: InformationMessageProps) {
  return (
    <div className='p-6 bg-primary_lighten rounded-base text-primary'>
      <div className='flex justify-between'>
        <div className='flex items-center'>
          <IconComponent
            name={iconName ?? IconName.Info}
            focusable={false}
            aria-hidden={true}
            className='mr-2 w-6 h-6 fill-primary shrink-0'
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
              className='h-6 w-6 fill-primary shrink-0'
            />
          </button>
        )}
      </div>
      {children && (
        <div className='mt-2 [&_a]:hover:text-primary_darken'>{children}</div>
      )}
    </div>
  )
}
