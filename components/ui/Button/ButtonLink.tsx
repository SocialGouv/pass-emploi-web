import { UrlObject } from 'url'

import Link from 'next/link'
import { ReactNode } from 'react'

import { ButtonStyle } from 'components/ui/Button/Button'
import styles from 'styles/components/Button.module.css'

interface Props {
  href: string | UrlObject
  children: ReactNode
  style?: ButtonStyle
  className?: any
  onClick?: () => void
}

export default function ButtonLink({
  children,
  href,
  className,
  style = ButtonStyle.PRIMARY,
  onClick = () => {},
}: Props) {
  return (
    <Link
      href={href}
      className={`${
        className ? className : ''
      } flex items-center justify-center text-s-bold ${
        styles.button
      } ${getColorStyleClassName(style)}`}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

function getColorStyleClassName(style: ButtonStyle): string {
  switch (style) {
    case ButtonStyle.PRIMARY:
      return styles.buttonPrimary
    case ButtonStyle.SECONDARY:
      return styles.buttonSecondary
    case ButtonStyle.TERTIARY:
      return styles.buttonTertiary
    case ButtonStyle.WARNING:
      return styles.buttonWarning
    default:
      return styles.buttonPrimary
  }
}
