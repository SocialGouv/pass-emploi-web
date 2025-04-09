import React, { ReactElement, ReactNode } from 'react'

interface THProps {
  children: ReactNode
  estCliquable?: boolean
  title?: string
}

export default function TH({
  children,
  estCliquable = false,
  title,
}: THProps): ReactElement {
  const style = `text-s-medium text-left text-content-color ${
    estCliquable ? 'hover:rounded-base hover:bg-primary-lighten' : 'p-4'
  }`

  return (
    <th scope='col' className={style} title={title}>
      {children}
    </th>
  )
}
