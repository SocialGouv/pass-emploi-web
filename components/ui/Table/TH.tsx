import React, { ReactNode } from 'react'

interface THProps {
  children: ReactNode
  asDiv?: boolean
  estCliquable?: boolean
  className?: string
}

export function TH({
  children,
  asDiv = false,
  className = '',
  estCliquable = false,
}: THProps): React.JSX.Element {
  const style = `text-s-medium text-left text-content_color ${
    estCliquable ? '' : 'p-4'
  } group-hover:first:rounded-l-base group-hover:last:rounded-r-base ${className}`

  if (asDiv)
    return (
      <div role='columnheader' className={'table-cell ' + style}>
        {children}
      </div>
    )
  else
    return (
      <th scope='col' className={style}>
        {children}
      </th>
    )
}
