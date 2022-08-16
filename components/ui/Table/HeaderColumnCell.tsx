import React from 'react'

interface HeaderColumnCellProps {
  children: any
}

export function HeaderColumnCell({ children }: HeaderColumnCellProps) {
  return (
    <div
      role='columnheader'
      className='table-cell text-base-regular text-left pb-4'
    >
      {children}
    </div>
  )
}
