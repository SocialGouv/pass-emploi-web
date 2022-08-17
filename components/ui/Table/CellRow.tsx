import React from 'react'

interface CellRowProps {
  className?: string
  children: any
}

export default function CellRow({ className, children }: CellRowProps) {
  return (
    <div
      role='cell'
      className={`table-cell text-base-medium p-4 align-middle ${
        className ?? ''
      } `}
    >
      {children}
    </div>
  )
}
