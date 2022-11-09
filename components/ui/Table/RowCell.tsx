import React from 'react'

interface RowCellProps {
  children: any
  className?: string
}

export default function RowCell({ children, className = '' }: RowCellProps) {
  const style = 'p-4 align-middle text-base-regular ' + className

  return (
    <div role='cell' className={'table-cell ' + style}>
      {children}
    </div>
  )
}
