import React from 'react'

interface BadgeProps {
  count: number
  backgroundColor: string
  textColor: string
  size: number
  css: string
}
export function Badge({
  count,
  size = 6,
  css = '',
  textColor,
  backgroundColor,
}: BadgeProps) {
  return (
    <span
      className={`w-${size} h-${size} inline-block text-center rounded-full text-${textColor} bg-${backgroundColor} text-s-bold ${css}`}
    >
      {count}
    </span>
  )
}
