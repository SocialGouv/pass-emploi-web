import styles from 'styles/components/Button.module.css'

type ButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  children?: React.ReactNode
  role?: string
  type?: 'button' | 'submit' | 'reset'
  controls?: string
  label?: string
  disabled?: boolean
  style?: ButtonStyle
  className?: any
  form?: string
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
  label,
  style = ButtonStyle.PRIMARY,
  className,
  form,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`${className ? className : ''} text-sm ${
        styles.button
      } ${getColorStyleClassName(style)}`}
      form={form ?? undefined}
      role={role ?? undefined}
      type={type ?? undefined}
      aria-controls={controls ?? undefined}
      aria-label={label ?? undefined}
      disabled={disabled}
      aria-disabled={disabled}
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
