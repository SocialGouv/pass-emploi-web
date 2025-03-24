import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { unsafeRandomId } from 'utils/helpers'

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
        return 'bg-primary-lighten'
      case 'secondary':
        return 'bg-white'
      case 'additional':
        return 'bg-additional-5-lighten'
    }
  }

  function getTextColor(): string {
    switch (style) {
      case 'primary':
      case 'secondary':
        return 'text-primary'
      case 'additional':
        return 'text-content-color'
    }
  }

  function TagIcon() {
    const iconStyle = 'inline w-4 h-4 fill-current mr-1'

    if (iconLabel) {
      const labelId = 'tag-icon-' + unsafeRandomId()
      return (
        <>
          <IconComponent
            name={iconName!}
            focusable={false}
            role='img'
            aria-labelledby={labelId}
            title={iconLabel}
            className={iconStyle}
          />
          <span id={labelId} className='sr-only'>
            {iconLabel}
          </span>
        </>
      )
    } else
      return (
        <IconComponent
          name={iconName!}
          aria-hidden={true}
          focusable={false}
          className={iconStyle}
        />
      )
  }

  return (
    <span
      className={`inline-flex items-center rounded-base ${
        iconName ? 'px-2' : 'px-4'
      } py-1 text-s-medium ${getTextColor()} ${getBackground()} whitespace-nowrap ${
        className ?? ''
      }`}
    >
      {iconName && <TagIcon />}
      {text}
    </span>
  )
}
