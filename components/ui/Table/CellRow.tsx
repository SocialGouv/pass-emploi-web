import React from 'react'

interface CellRowProps {
  className?: string
  children: any
}

export default function CellRow({ className, children }: CellRowProps) {
  return (
    <div
      role='cell'
      className={`table-cell p-4 align-middle ${className ?? ''} ${
        className ?? 'text-base-regular'
      }`}
    >
      {children}
    </div>
  )
}
