import styles from 'styles/components/Button.module.css'

type ButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  children?: React.ReactNode
  role?: string
  type?: 'button' | 'submit' | 'reset'
  controls?: string
  label?: string
  disabled?: boolean
  selected?: boolean
  style?: ButtonStyle
  className?: any
  form?: string
  id?: string
  tabIndex?: number
}

export enum ButtonStyle {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  WARNING = 'WARNING',
}

const Button = ({
  onClick,
  children,
  role,
  type,
  controls,
  disabled = false,
  selected = false,
  label,
  style = ButtonStyle.PRIMARY,
  className,
  form,
  id,
  tabIndex,
}: ButtonProps) => {
  return (
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
  )
}

const getColorStyleClassName = (style: ButtonStyle | undefined): string => {
  switch (style) {
    case ButtonStyle.SECONDARY:
      return styles.buttonSecondary
    case ButtonStyle.WARNING:
      return styles.buttonWarning
    case ButtonStyle.PRIMARY:
    default:
      return styles.buttonPrimary
  }
}

export default Button
