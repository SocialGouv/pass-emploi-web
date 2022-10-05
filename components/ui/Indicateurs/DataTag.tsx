import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface DataTagProps {
  text: string
  iconName?: IconName
  className?: string
}

export function DataTag({ text, iconName, className }: DataTagProps) {
  return (
    <span
      className={`${
        iconName ? 'inline-flex items-center' : ''
      } bg-primary_lighten border border-solid border-primary rounded-x_large ${
        iconName ? 'px-2' : 'px-4'
      } py-1 text-s-regular text-primary whitespace-nowrap ${className ?? ''}`}
    >
      {iconName && (
        <IconComponent
          name={iconName}
          aria-hidden={true}
          focusable={false}
          className='inline w-4 h-4 fill-[currentColor] mr-1'
        />
      )}
      {text}
    </span>
  )
}
