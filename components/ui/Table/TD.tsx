import React, { ReactNode } from 'react'

interface TDProps {
  children?: ReactNode
  asDiv?: boolean
  className?: string
}

export default function TD({
  children,
  asDiv = false,
  className = '',
}: TDProps) {
  const style = 'p-4 align-middle text-base-regular ' + className

  if (asDiv)
    return (
      <div role='cell' className={'table-cell ' + style}>
        {children}
      </div>
    )
  else return <td className={style}>{children}</td>
}
