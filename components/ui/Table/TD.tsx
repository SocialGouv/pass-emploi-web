import React, { ComponentPropsWithoutRef, ReactNode } from 'react'

type TDProps = Omit<ComponentPropsWithoutRef<'td'>, 'children'> & {
  children?: ReactNode
  asDiv?: boolean
  isBold?: boolean
}

export default function TD({
  children,
  asDiv = false,
  className = '',
  isBold = false,
  ...props
}: TDProps) {
  const style = `p-4 align-middle  ${
    isBold ? 'text-base-bold' : 'text-base-regular'
  } group-hover:first:rounded-l-base group-hover:last:rounded-r-base ${className}`

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
