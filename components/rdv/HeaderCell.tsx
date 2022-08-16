import React from 'react'

interface HeaderCellProps {
  label: string
  srOnly?: boolean
}

export const HeaderCell = ({ label, srOnly }: HeaderCellProps) => {
  return (
    <div
      role='columnheader'
      className={`table-cell text-base-regular pb-3 px-3 ${
        srOnly ? 'sr-only' : ''
      }`}
    >
      {label}
    </div>
  )
}
