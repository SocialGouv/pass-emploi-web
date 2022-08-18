import React from 'react'

interface TagProps {
  label: string
  color: string
  backgroundColor: string
  className?: string
}

export function Tag({ label, color, backgroundColor, className }: TagProps) {
  return (
    <span
      className={`text-s-regular border border-solid border-${color} text-${color} px-3 py-[4px] bg-${backgroundColor} rounded-x_large whitespace-nowrap ${
        className ?? ''
      }`}
    >
      {label}
    </span>
  )
}
