import React, { MouseEventHandler, ReactNode } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import styles from 'styles/components/Button.module.css'

interface Props {
  children: ReactNode
  style?: ButtonStyle
  className?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  type?: 'button' | 'submit' | 'reset'
  controls?: string
  describedBy?: string
  label?: string
  disabled?: boolean
  form?: string
  id?: string
  isLoading?: boolean
}

export enum ButtonStyle {
  PRIMARY = 'PRIMARY',
  PRIMARY_DARK = 'PRIMARY_DARK',
  SECONDARY = 'SECONDARY',
  TERTIARY = 'TERTIARY',
  WARNING = 'WARNING',
}

export default function Button({
  children,
  onClick,
  className,
  style = ButtonStyle.PRIMARY,
  form,
  id,
  type,
  controls,
  describedBy,
  label,
  disabled,
  isLoading = false,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`${className ? className : ''} relative text-s-bold ${
        styles.button
      } ${getColorStyleClassName(style)}`}
      form={form ?? undefined}
      id={id ?? undefined}
      type={type ?? undefined}
      aria-controls={controls ?? undefined}
      aria-label={label ?? undefined}
      aria-describedby={describedBy ?? undefined}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
    >
      <span role='alert'>
        {isLoading && (
          <>
            <IconComponent
              aria-hidden={true}
              focusable={false}
              name={IconName.Spinner}
              title='Chargement en cours'
              className='w-6 h-6 fill-white animate-spin absolute top-0 bottom-0 left-0 right-0 m-auto'
            />
            <span className='sr-only'>Chargement en cours</span>
          </>
        )}
      </span>

      <span
        className={`flex items-center justify-center ${
          isLoading ? 'invisible' : ''
        }`}
      >
        {children}
      </span>
    </button>
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
    case undefined:
    default:
      return ButtonStyle.PRIMARY
  }
}
