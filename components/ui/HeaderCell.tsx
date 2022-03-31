import React from 'react'

interface HeaderCellProps {
  label: string
  scope?: string
  srOnly?: boolean
}

export const HeaderCell = ({ label, scope, srOnly }: HeaderCellProps) => {
  return (
    <th
      className={`text-xs-regular text-grey_800 py-2 px-3 ${
        srOnly ? 'sr-only' : ''
      }`}
      scope={scope}
    >
      {label}
    </th>
  )
}
