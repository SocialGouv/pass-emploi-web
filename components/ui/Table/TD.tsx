import React, { ComponentPropsWithoutRef, ReactNode } from 'react'

type TDProps = Omit<ComponentPropsWithoutRef<'td'>, 'children'> & {
  children?: ReactNode
  isBold?: boolean
}

export default function TD({
  children,
  className = '',
  isBold = false,
  ...props
}: TDProps) {
  const style = `p-4 align-middle  ${
    isBold ? 'text-base-bold' : 'text-base-regular'
  } group-hover:first:rounded-l-base group-hover:last:rounded-r-base ${className}`

  return (
    <td className={style} {...props}>
      {children}
    </td>
  )
}
