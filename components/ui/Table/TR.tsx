import Link from 'next/link'
import React, { MouseEvent, ReactElement } from 'react'

type Children = { children: Array<ReactElement | false | undefined> }
type TRProps = Children & {
  isHeader?: boolean
  asDiv?: boolean
  onClick?: (e: MouseEvent) => void
}
type TRLinkProps = Children & { href: string; label: string }

export function TR(props: TRProps | TRLinkProps) {
  const style = 'focus-within:bg-primary_lighten rounded-base shadow-base'
  const clickableStyle = 'cursor-pointer hover:bg-primary_lighten'

  if (isLink(props)) {
    const { href, label, children } = props
    return (
      <Link
        href={href}
        role='row'
        aria-label={label}
        title={label}
        className={`table-row ${style} ${clickableStyle}`}
      >
        {React.Children.map(
          children,
          (child) => child && React.cloneElement(child, { asDiv: true })
        )}
      </Link>
    )
  } else if (props.asDiv) {
    const { isHeader, onClick, children } = props
    return (
      <div
        role='row'
        className={`table-row ${!isHeader ? style : ''} ${
          onClick ? clickableStyle : ''
        }`}
        onClick={onClick}
      >
        {React.Children.map(
          children,
          (child) => child && React.cloneElement(child, { asDiv: true })
        )}
      </div>
    )
  } else {
    const { isHeader, onClick, children } = props
    return (
      <tr className={!isHeader ? style : ''} onClick={onClick}>
        {children}
      </tr>
    )
  }
}

function isLink(props: TRProps | TRLinkProps): props is TRLinkProps {
  return Object.prototype.hasOwnProperty.call(props, 'href')
}
