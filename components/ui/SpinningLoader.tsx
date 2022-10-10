import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

export function SpinningLoader() {
  return (
    <IconComponent
      name={IconName.Spinner}
      aria-label='Chargement…'
      focusable={false}
      className='w-20 h-20 m-auto fill-primary animate-spin'
      title='Chargement…'
    />
  )
}
