import styles from 'styles/components/Button.module.css'

type ButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  children?: React.ReactNode
  role?: string
  type?: any
  label?: string
  disabled?: boolean
  style?: ButtonColorStyle
  className?: any
  form?: string
}

export enum ButtonColorStyle {
  BLUE = 'blue',
  WHITE = 'white',
  RED = 'red',
}

const Button = ({
  onClick,
  children,
  role,
  type,
  disabled = false,
  label,
  style = ButtonColorStyle.BLUE,
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
      aria-label={label ?? undefined}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  )
}

const getColorStyleClassName = (
  style: ButtonColorStyle | undefined
): string => {
  switch (style) {
    case ButtonColorStyle.WHITE:
      return styles.buttonWhite
    case ButtonColorStyle.RED:
      return styles.buttonRed
    case ButtonColorStyle.BLUE:
    default:
      return styles.buttonBlue
  }
}

export default Button
