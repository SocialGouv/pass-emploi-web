import React, { ReactNode } from 'react'

interface THProps {
  children: ReactNode
  asDiv?: boolean
  className?: string
}

export function TH({
  children,
  asDiv = false,
  className = '',
}: THProps): JSX.Element {
  const style = 'text-s-medium text-left text-content_color p-4 ' + className

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
