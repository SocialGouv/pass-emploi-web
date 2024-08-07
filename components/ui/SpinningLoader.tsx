import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

export function SpinningLoader({ className }: { className?: string }) {
  return (
    <>
      <IconComponent
        name={IconName.Spinner}
        focusable={false}
        className={`w-20 h-20 m-auto fill-primary animate-spin ${className ?? ''}`}
        title='Chargement en cours'
      />
      <span className='sr-only' role='alert'>
        Chargement en cours
      </span>
    </>
  )
}
