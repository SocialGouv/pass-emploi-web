import Link from 'next/link'
import React, { ReactNode } from 'react'

import { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import styles from 'styles/components/Button.module.css'

interface Props {
  href: string
  externalIcon?: IconName
  children?: ReactNode
  label?: string
  style?: ButtonStyle
  className?: string
  onClick?: () => void
}

export default function ButtonLink({
  children,
  href,
  className,
  externalIcon,
  label,
  style = ButtonStyle.PRIMARY,
  onClick = () => {},
}: Props) {
  return (
    <>
      {!externalIcon && (
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
      )}

      {externalIcon && (
        <a
          href={href}
          target='_blank'
          rel='noreferrer noopener'
          className={`${
            className ? className : ''
          } flex items-center justify-center text-s-bold ${
            styles.button
          } ${getColorStyleClassName(style)}`}
          aria-label={`${label} (nouvelle fenêtre)`}
          onClick={onClick}
        >
          <IconComponent
            name={externalIcon}
            className='mr-2 w-4 h-4 fill-current'
            focusable={false}
            aria-hidden={true}
          />
          {label}
        </a>
      )}
    </>
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
    case ButtonStyle.PRIMARY_DARK:
      return styles.buttonPrimaryDark
  }
}
