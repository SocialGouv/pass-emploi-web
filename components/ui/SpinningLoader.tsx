import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

export function SpinningLoader() {
  return (
    <IconComponent
      name={IconName.Spinner}
      aria-label='Chargement…'
      focusable={false}
      className='fill-primary animate-spin'
    />
  )
}
