import Link from 'next/link'
import React, { ReactElement, MouseEvent } from 'react'

type Children = { children: Array<ReactElement | false | undefined> }
type TRProps = Children & { asDiv?: boolean; onClick?: (e: MouseEvent) => void }
type TRLinkProps = Children & { href: string; label: string }

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
          {React.Children.map(
            props.children,
            (child) => child && React.cloneElement(child, { asDiv: true })
          )}
        </a>
      </Link>
    )
  } else if (props.asDiv) {
    return (
      <div role='row' className={'table-row ' + style} onClick={props.onClick}>
        {React.Children.map(
          props.children,
          (child) => child && React.cloneElement(child, { asDiv: true })
        )}
      </div>
    )
  } else {
    return (
      <tr className={style} onClick={props.onClick}>
        {props.children}
      </tr>
    )
  }
}

function isLink(props: TRProps | TRLinkProps): props is TRLinkProps {
  return Object.prototype.hasOwnProperty.call(props, 'href')
}
