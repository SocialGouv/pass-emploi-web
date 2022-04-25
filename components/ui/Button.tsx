import { MouseEventHandler, ReactNode } from 'react'

import styles from 'styles/components/Button.module.css'

interface Props {
  children: ReactNode
  style?: ButtonStyle
  className?: any
  onClick?: MouseEventHandler<HTMLButtonElement>
  role?: string
  type?: 'button' | 'submit' | 'reset'
  controls?: string
  label?: string
  disabled?: boolean
  selected?: boolean
  form?: string
  id?: string
  tabIndex?: number
}

export enum ButtonStyle {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  WARNING = 'WARNING',
}

export default function Button({
  children,
  onClick,
  className,
  style = ButtonStyle.PRIMARY,
  form,
  id,
  tabIndex,
  role,
  type,
  controls,
  label,
  disabled,
  selected,
}: Props) {
  return (
    <>
      <button
        onClick={onClick}
        className={`${className ? className : ''} text-sm ${
          styles.button
        } ${getColorStyleClassName(style)}`}
        form={form ?? undefined}
        id={id ?? undefined}
        tabIndex={tabIndex ?? undefined}
        role={role ?? undefined}
        type={type ?? undefined}
        aria-controls={controls ?? undefined}
        aria-label={label ?? undefined}
        disabled={disabled}
        aria-disabled={disabled}
        aria-selected={selected}
      >
        {children}
      </button>
    </>
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
