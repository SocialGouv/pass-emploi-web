import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

export default function SectionTitleDot() {
  return (
    <IconComponent
      name={IconName.DecorativePoint}
      focusable={false}
      aria-hidden={true}
      className='inline w-2 h-2 fill-primary mr-4'
    />
  )
}
