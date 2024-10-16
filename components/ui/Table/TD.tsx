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
  const style = `p-4 ${
    isBold ? 'text-base-bold' : 'text-base-regular'
  } first:rounded-l-base last:rounded-r-base ${className}`

  return (
    <td className={style} {...props}>
      {children}
    </td>
  )
}
