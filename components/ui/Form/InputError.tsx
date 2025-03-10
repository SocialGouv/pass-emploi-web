import React, { ForwardedRef, forwardRef } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface InputErrorProps {
  children: string
  id: string
  className?: string
}

export function InputError(
  { id, children, className }: InputErrorProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      id={id}
      className={`${className ?? ''} flex items-center`}
      ref={ref}
      tabIndex={ref ? -1 : undefined}
    >
      <IconComponent
        name={IconName.Error}
        focusable={false}
        aria-hidden={true}
        className='w-4 h-4 mr-1 shrink-0 fill-warning'
      />
      <p className='text-warning text-s-regular'>{children}</p>
    </div>
  )
}

export default forwardRef(InputError)
