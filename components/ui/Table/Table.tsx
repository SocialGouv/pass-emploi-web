import React, { ReactElement } from 'react'

import { Badge } from 'components/ui/Indicateurs/Badge'

interface TableProps {
  children: Array<ReactElement | false>
  caption: { text: string; count?: number; visible?: boolean }
  asDiv?: boolean
}

export default function Table({
  children,
  caption,
  asDiv = false,
}: TableProps) {
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

  if (asDiv)
    return (
      <div role='table' className={'table ' + style} aria-label={captionLabel}>
        {caption.visible && (
          <div aria-hidden={true} className={'table-caption ' + captionStyle}>
            <Caption />
          </div>
        )}
        {React.Children.map(
          children,
          (child) => child && React.cloneElement(child, { asDiv: true })
        )}
      </div>
    )
  else
    return (
      <table className={style}>
        <caption
          className={
            captionStyle + (caption.visible ? ' text-left' : ' sr-only')
          }
          aria-label={captionLabel}
        >
          <Caption />
        </caption>
        {children}
      </table>
    )
}
