import { UrlObject } from 'url'

import Link from 'next/link'
import { ReactNode } from 'react'

import { ButtonStyle } from 'components/ui/Button'
import styles from 'styles/components/Button.module.css'

interface Props {
  href: string | UrlObject
  children: ReactNode
  style?: ButtonStyle
  className?: any
}

export default function ButtonLink({
  children,
  href,
  className,
  style = ButtonStyle.PRIMARY,
}: Props) {
  return (
    <Link href={href}>
      <a
        className={`${className ? className : ''} text-sm ${
          styles.button
        } ${getColorStyleClassName(style)}`}
      >
        {children}
      </a>
    </Link>
  )
}

function getColorStyleClassName(style: ButtonStyle): string {
  switch (style) {
    case ButtonStyle.SECONDARY:
      return styles.buttonSecondary
    case ButtonStyle.WARNING:
      return styles.buttonWarning
    case ButtonStyle.PRIMARY:
      return styles.buttonPrimary
  }
}
