import React, {
  ComponentPropsWithoutRef,
  ForwardedRef,
  forwardRef,
  ReactNode,
} from 'react'

type TDProps = Omit<ComponentPropsWithoutRef<'td'>, 'children'> & {
  children?: ReactNode
  isBold?: boolean
}

function TD(
  { children, className = '', isBold = false, ...props }: TDProps,
  ref: ForwardedRef<HTMLTableCellElement>
) {
  const style = `p-4 ${
    isBold ? 'text-base-bold' : 'text-base-regular'
  } first:rounded-l-base last:rounded-r-base ${className}`

  return (
    <td ref={ref} className={style} {...props}>
      {children}
    </td>
  )
}

export default forwardRef(TD)
