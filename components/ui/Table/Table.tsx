import React, { ReactNode } from 'react'

import { Badge } from 'components/ui/Indicateurs/Badge'

interface TableProps {
  children: ReactNode
  caption: { text: string; count?: number; visible?: boolean }
}

export default function Table({ children, caption }: TableProps) {
  return (
    <table className={'w-full border-spacing-y-2 border-separate'}>
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
      className={`text-m-bold text-grey_800 ${visible ? 'text-left' : 'sr-only'}`}
      aria-label={count ? `${text} (${count} éléments)` : text}
    >
      {text}{' '}
      {count !== undefined && (
        <Badge
          count={count}
          textColor='primary'
          bgColor='primary_lighten'
          size={6}
        />
      )}
    </caption>
  )
}
