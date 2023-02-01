import React from 'react'

interface BadgeProps {
  count: number
  textColor: string
  bgColor: string
  size: number
  style?: string
}
export function Badge({ count, size, textColor, bgColor, style }: BadgeProps) {
  return (
    <span
      className={`w-${size} h-${size} inline-block text-center rounded-full text-${textColor} bg-${bgColor} text-s-bold ${style}`}
    >
      {count}
    </span>
  )
}
