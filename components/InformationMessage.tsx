import React, { ReactNode } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface InformationMessageProps {
  content: string
  iconName?: IconName
  children?: ReactNode
}

export default function InformationMessage({
  content,
  iconName,
  children,
}: InformationMessageProps) {
  return (
    <div className='p-6 bg-primary_lighten rounded-medium text-primary'>
      <div className='flex items-center'>
        <IconComponent
          name={iconName ?? IconName.Info}
          focusable={false}
          aria-hidden={true}
          className='mr-2 w-6 h-6 shrink-0'
        />
        <p className='text-base-medium'>{content}</p>
      </div>
      {children && <div className='mt-2'>{children}</div>}
    </div>
  )
}
