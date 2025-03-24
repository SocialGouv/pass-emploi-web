import React, { ForwardedRef, forwardRef, ReactNode } from 'react'

import { Badge } from 'components/ui/Indicateurs/Badge'

interface TableProps {
  children: ReactNode
  caption: { text: string; count?: number; visible?: boolean }
}

function Table(
  { children, caption }: TableProps,
  ref: ForwardedRef<HTMLTableElement>
) {
  return (
    <table
      tabIndex={ref ? -1 : undefined}
      ref={ref}
      className='w-full border-spacing-y-2 border-separate'
    >
      <Caption {...caption} />
      {children}
    </table>
  )
}

function Caption({
  text,
  count,
  visible,
}: {
  text: string
  count?: number
  visible?: boolean
}) {
  return (
    <caption
      className={`text-m-bold text-grey-800 ${visible ? 'text-left' : 'sr-only'}`}
      aria-label={count ? `${text} (${count} éléments)` : text}
    >
      {text}{' '}
      {count !== undefined && (
        <Badge count={count} className='text-primary bg-primary-lighten' />
      )}
    </caption>
  )
}

export default forwardRef(Table)
