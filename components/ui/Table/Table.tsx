import React, { ReactElement } from 'react'

interface TableProps {
  children: Array<ReactElement | false>
  caption: string | { text: string; visible: true }
  asDiv?: boolean
}

export default function Table({
  children,
  caption,
  asDiv = false,
}: TableProps) {
  const style = 'w-full border-spacing-y-2 border-separate'
  const captionVisible = captionIsVisible(caption)
  const captionText = captionVisible ? caption.text : caption
  const captionStyle = 'text-m-bold text-grey_800'

  if (asDiv)
    return (
      <div role='table' className={'table ' + style} aria-label={captionText}>
        {captionVisible && (
          <div aria-hidden={true} className={'table-caption ' + captionStyle}>
            {captionText}
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
            captionStyle + (captionVisible ? ' text-left' : ' sr-only')
          }
        >
          {captionText}
        </caption>
        {children}
      </table>
    )
}

function captionIsVisible(
  caption: string | { text: string; visible: true }
): caption is { text: string; visible: true } {
  return Object.prototype.hasOwnProperty.call(caption, 'visible')
}
