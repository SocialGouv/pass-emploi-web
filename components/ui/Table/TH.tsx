import React, { ReactElement, ReactNode } from 'react'

interface THProps {
  children: ReactNode
  estCliquable?: boolean
  title?: string
}

export function TH({
  children,
  estCliquable = false,
  title,
}: THProps): ReactElement {
  const style = `text-s-medium text-left text-content_color ${
    estCliquable ? 'hover:rounded-base hover:bg-primary_lighten' : 'p-4'
  }`

  return (
    <th scope='col' className={style} title={title}>
      {children}
    </th>
  )
}
