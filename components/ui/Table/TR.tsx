import Link from 'next/link'
import React, { ReactNode } from 'react'

type TRProps = { children: ReactNode }
type TRLinkProps = TRProps & { href: string; label: string }

export function TR(props: TRProps | TRLinkProps) {
  const style = 'focus-within:primary_lighten rounded-small shadow-s'
  const clickableStyle = 'cursor-pointer hover:bg-primary_lighten'

  if (isLink(props)) {
    return (
      <Link href={props.href}>
        <a
          role='row'
          aria-label={props.label}
          title={props.label}
          className={`table-row ${style} ${clickableStyle}`}
        >
          {props.children}
        </a>
      </Link>
    )
  } else {
    return <tr className={style}>{props.children}</tr>
  }
}

function isLink(props: TRProps | TRLinkProps): props is TRLinkProps {
  return Object.prototype.hasOwnProperty.call(props, 'href')
}
