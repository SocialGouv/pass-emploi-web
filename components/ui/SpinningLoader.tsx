import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

export function SpinningLoader({
  className,
  alert = false,
}: {
  className?: string
  alert?: boolean
}) {
  return (
    <>
      <IconComponent
        name={IconName.Spinner}
        aria-hidden={true}
        focusable={false}
        className={`w-20 h-20 m-auto fill-primary animate-spin ${className ?? ''}`}
        title='Chargement en cours'
      />
      <span className='sr-only' role={alert ? 'alert' : 'none'}>
        Chargement en cours
      </span>
    </>
  )
}
