import React from 'react'

interface HeaderCellProps {
  children: any
  className?: string
}

export function HeaderCell({
  children,
  className = '',
}: HeaderCellProps): JSX.Element {
  const style = 'text-base-regular text-left p-4 ' + className

  return (
    <div role='columnheader' className={'table-cell ' + style}>
      {children}
    </div>
  )
}
