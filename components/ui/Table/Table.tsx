import React, { ReactNode } from 'react'

import { Badge } from 'components/ui/Indicateurs/Badge'

interface TableProps {
  children: ReactNode
  caption: { text: string; count?: number; visible?: boolean }
}

export default function Table({ children, caption }: TableProps) {
  const style = 'w-full border-spacing-y-2 border-separate'
  const captionStyle = 'text-m-bold text-grey_800'
  const captionLabel = caption.count
    ? `${caption.text} (${caption.count})`
    : caption.text

  function Caption() {
    return (
      <>
        {caption.text}{' '}
        {caption.count !== undefined && (
          <Badge
            count={caption.count}
            textColor='primary'
            bgColor='primary_lighten'
            size={6}
          />
        )}
      </>
    )
  }

  return (
    <table className={style}>
      <caption
        className={captionStyle + (caption.visible ? ' text-left' : ' sr-only')}
        aria-label={captionLabel}
      >
        <Caption />
      </caption>
      {children}
    </table>
  )
}
