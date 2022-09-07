import React from 'react'

interface RowCellProps {
  children: any
  className?: string
}

export default function RowCell({ className, children }: RowCellProps) {
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
