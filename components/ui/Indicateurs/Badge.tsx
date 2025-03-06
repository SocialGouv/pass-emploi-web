import React from 'react'

type BadgeProps = {
  count: number
  className: string
}
export function Badge({ count, className }: BadgeProps) {
  return (
    <span
      className={
        'w-6 h-6 inline-block text-center rounded-full text-s-bold ' + className
      }
    >
      {count}
    </span>
  )
}
