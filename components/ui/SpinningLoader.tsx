import React, { ForwardedRef, forwardRef } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

function SpinningLoader(
  {
    className,
    alert = false,
  }: {
    className?: string
    alert?: boolean
  },
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div ref={ref} tabIndex={ref ? -1 : undefined} title='Chargement en cours'>
      <IconComponent
        name={IconName.Spinner}
        aria-hidden={true}
        focusable={false}
        className={`w-20 h-20 m-auto fill-primary animate-spin ${className ?? ''}`}
      />
      <span className='sr-only' role={alert ? 'alert' : 'none'}>
        Chargement en cours
      </span>
    </div>
  )
}

export default forwardRef(SpinningLoader)
