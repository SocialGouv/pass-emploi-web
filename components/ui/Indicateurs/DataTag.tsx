import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface DataTagProps {
  text: string
  style?: 'primary' | 'additional'
  iconName?: IconName
  className?: string
  iconLabel?: string
}

export function DataTag({
  text,
  style = 'primary',
  iconName,
  className,
  iconLabel,
}: DataTagProps) {
  const color = style === 'primary' ? 'text-primary' : 'text-content_color'
  const background =
    style === 'primary' ? 'bg-primary_lighten' : 'bg-additional_5_lighten'

  return (
    <span
      className={`inline-flex items-center rounded-base ${
        iconName ? 'px-2' : 'px-4'
      } py-1 text-s-medium ${color} ${background} whitespace-nowrap ${
        className ?? ''
      }`}
    >
      {iconName && (
        <IconComponent
          name={iconName}
          aria-hidden={!iconLabel}
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
