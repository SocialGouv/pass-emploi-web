import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface DataTagProps {
  text: string
  style?: 'primary' | 'secondary' | 'additional'
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
  function getBackground(): string {
    switch (style) {
      case 'primary':
        return 'bg-primary_lighten'
      case 'secondary':
        return 'bg-white'
      case 'additional':
        return 'bg-additional_5_lighten'
    }
  }

  function getTextColor(): string {
    switch (style) {
      case 'primary':
      case 'secondary':
        return 'text-primary'
      case 'additional':
        return 'text-content_color'
    }
  }
  return (
    <span
      className={`inline-flex items-center rounded-base ${
        iconName ? 'px-2' : 'px-4'
      } py-1 text-s-medium ${getTextColor()} ${getBackground()} whitespace-nowrap ${
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
          className='inline w-4 h-4 fill-current mr-1'
        />
      )}
      {text}
    </span>
  )
}
