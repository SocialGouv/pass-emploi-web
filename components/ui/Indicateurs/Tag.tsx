import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

interface TagProps {
  label: string
  color: string
  backgroundColor: string
  className?: string
  iconName?: IconName
}

export function Tag({
  label,
  color,
  backgroundColor,
  className,
  iconName,
}: TagProps) {
  return (
    <span
      className={`flex items-center w-fit text-s-regular border border-solid border-${color} text-${color} px-3 bg-${backgroundColor} rounded-x_large whitespace-nowrap ${
        className ?? ''
      }`}
    >
      {iconName && (
        <IconComponent
          name={iconName}
          aria-hidden={true}
          className='h-5 w-5 mr-1 fill-[currentColor]'
        />
      )}
      {label}
    </span>
  )
}
