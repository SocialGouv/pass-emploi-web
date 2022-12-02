import React, { ReactNode } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface InformationMessageProps {
  content: string | string[]
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
      <div className={`flex ${!Array.isArray(content) ? '' : 'items-center'}`}>
        <IconComponent
          name={iconName ?? IconName.Info}
          focusable={false}
          aria-hidden={true}
          className='mr-2 w-6 h-6 shrink-0'
        />
        {Array.isArray(content) && (
          <div>
            {content.map((line) => (
              <p key={line} className='text-base-bold'>
                {line}
              </p>
            ))}
          </div>
        )}
        {!Array.isArray(content) && <p className='text-base-bold'>{content}</p>}
      </div>
      {children && <div className='mt-2'>{children}</div>}
    </div>
  )
}
