import React from 'react'

interface HeaderCellProps {
  children: any
  className?: string
}

export function HeaderCell({ children, className }: HeaderCellProps) {
  return (
    <div
      role='columnheader'
      className={`table-cell text-base-regular text-left p-4 ${
        className ?? ''
      }`}
    >
      {children}
    </div>
  )
}
