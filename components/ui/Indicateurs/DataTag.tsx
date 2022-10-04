import React from 'react'

import { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'

interface DataTagProps {
  text: string
  iconName?: IconName
  className?: string
  style?: ButtonStyle.PRIMARY | ButtonStyle.WARNING
}

export function DataTag({
  text,
  iconName,
  className,
  style = ButtonStyle.PRIMARY,
}: DataTagProps) {
  return (
    <span
      className={`${
        iconName ? 'inline-flex items-center px-2' : 'px-4'
      } ${getStyle(
        style
      )} border border-solid rounded-x_large py-1 text-s-regular whitespace-nowrap ${
        className ?? ''
      }`}
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

function getStyle(style: ButtonStyle.PRIMARY | ButtonStyle.WARNING): string {
  switch (style) {
    case ButtonStyle.PRIMARY:
      return 'bg-primary_ligten border-primary text-primary'
    case ButtonStyle.WARNING:
      return 'bg-warning_lighten border-warning text-warning'
  }
}
