import React from 'react'

interface HeaderCellProps {
  children?: any
  scope?: string
  srOnly?: boolean
}

export const HeaderCell = ({ children, scope, srOnly }: HeaderCellProps) => {
  return (
    <th
      className={`text-xs-medium text-grey_800 ${srOnly ? 'sr-only' : ''}`}
      scope={scope}
    >
      {children}
    </th>
  )
}
