import React, { ReactNode } from 'react'

import InfoIcon from '../assets/icons/information.svg'

interface InformationMessageProps {
  content: string
  children?: ReactNode
}

export default function InformationMessage({
  content,
  children,
}: InformationMessageProps) {
  return (
    <div className='p-6 bg-primary_lighten rounded-medium text-primary'>
      <div className='flex items-center'>
        <InfoIcon
          focusable={false}
          aria-hidden={true}
          className='mr-2 shrink-0'
        />
        <p className='text-base-medium'>{content}</p>
      </div>
      {children && <div className='mt-2'>{children}</div>}
    </div>
  )
}
