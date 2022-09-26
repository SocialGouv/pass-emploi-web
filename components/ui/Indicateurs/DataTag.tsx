import React from 'react'

interface DataTagProps {
  type: string
  className?: string
}

export const DataTag = ({ type, className }: DataTagProps) => {
  return (
    <span
      className={`bg-primary/[.15] border border-solid border-primary rounded-x_large px-4 py-1 text-s-regular text-primary whitespace-nowrap ${
        className ?? ''
      }`}
    >
      {type}
    </span>
  )
}
