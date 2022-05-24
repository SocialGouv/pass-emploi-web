import React from 'react'

interface TagProps {
  label: string
  color: string
  backgroundColor: string
}

export function Tag({ label, color, backgroundColor }: TagProps) {
  return (
    <span
      className={`table-cell text-xs-medium border border-solid border-${color} text-${color} px-4 py-[2px] bg-${backgroundColor} rounded-x_large whitespace-nowrap`}
    >
      {label}
    </span>
  )
}
