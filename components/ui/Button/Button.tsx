import { MouseEventHandler, ReactNode } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import styles from 'styles/components/Button.module.css'

interface Props {
  children: ReactNode
  style?: ButtonStyle
  className?: any
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
  PRIMARY_BRSA = 'PRIMARY_BRSA',
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
      className={`${className ? className : ''} text-s-bold relative ${
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
      <span className='flex items-center justify-center'>
        {isLoading && (
          <IconComponent
            name={IconName.Spinner}
            className='w-6 h-6 fill-blanc animate-spin absolute m-auto'
          />
        )}
        <span className={`flex ${isLoading ? 'invisible' : ''}`}>
          {children}
        </span>
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
    case ButtonStyle.PRIMARY_BRSA:
      return styles.buttonPrimaryDarkenBRSA
    case undefined:
    default:
      return ButtonStyle.PRIMARY
  }
}
