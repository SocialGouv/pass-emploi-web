import React, { ComponentPropsWithoutRef, ReactNode } from 'react'

type TDProps = Omit<ComponentPropsWithoutRef<'td'>, 'children'> & {
  children?: ReactNode
  asDiv?: boolean
}

export default function TD({
  children,
  asDiv = false,
  className = '',
  ...props
}: TDProps) {
  const style = 'p-4 align-middle text-base-regular ' + className

  if (asDiv)
    return (
      <div role='cell' className={'table-cell ' + style} {...props}>
        {children}
      </div>
    )
  else
    return (
      <td className={style} {...props}>
        {children}
      </td>
    )
}
