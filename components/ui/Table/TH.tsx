import React, { ReactNode } from 'react'

interface THProps {
  children: ReactNode
  asDiv?: boolean
  estCliquable?: boolean
  title?: string
}

export function TH({
  children,
  asDiv = true,
  estCliquable = false,
  title,
}: THProps): React.JSX.Element {
  const style = `text-s-medium text-left text-content_color ${
    estCliquable ? 'rounded-base hover:bg-primary_lighten' : 'p-4'
  } group-hover:first:rounded-l-base group-hover:last:rounded-r-base`

  if (asDiv)
    return (
      <div role='columnheader' className={'table-cell ' + style} title={title}>
        {children}
      </div>
    )
  else
    return (
      <th scope='col' className={style} title={title}>
        {children}
      </th>
    )
}
