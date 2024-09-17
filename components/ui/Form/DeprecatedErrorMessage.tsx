import React, { ForwardedRef, forwardRef } from 'react'

import Exclamation from 'assets/icons/informations/error.svg'

type DeprecatedErrorMessageProps = {
  children: React.ReactNode
  className?: string
}

function DeprecatedErrorMessage(
  { children, className }: DeprecatedErrorMessageProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      className={(className || '') + ' flex items-center mb-8'}
      ref={ref}
      tabIndex={-1}
    >
      <Exclamation
        className='mr-1 h-4 w-4 fill-warning'
        focusable={false}
        aria-hidden={true}
      />
      <p className='text-s-bold text-warning'>{children}</p>
    </div>
  )
}

export default forwardRef(DeprecatedErrorMessage)
