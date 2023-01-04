import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface DataTagProps {
  text: string
  iconName?: IconName
  className?: string
  iconLabel?: string
}

export function DataTag({
  text,
  iconName,
  className,
  iconLabel,
}: DataTagProps) {
  return (
    <span
      className={`inline-flex items-center bg-primary_lighten border border-solid border-primary rounded-x_large ${
        iconName ? 'px-2' : 'px-4'
      } py-1 text-s-regular text-primary whitespace-nowrap ${className ?? ''}`}
    >
      {iconName && (
        <IconComponent
          name={iconName}
          aria-hidden={iconLabel ? false : true}
          focusable={false}
          aria-label={iconLabel}
          title={iconLabel}
          className='inline w-4 h-4 fill-[currentColor] mr-1'
        />
      )}
      {text}
    </span>
  )
}
