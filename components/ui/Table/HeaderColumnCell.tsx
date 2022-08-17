import React from 'react'

interface HeaderColumnCellProps {
  children: any
  className?: string
}

export function HeaderColumnCell({
  children,
  className,
}: HeaderColumnCellProps) {
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
