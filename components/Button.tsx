import styles from 'styles/components/Button.module.css'

type ButtonProps = {
	onClick?: React.MouseEventHandler<HTMLButtonElement>
	children?: React.ReactNode
	role?: string
	type?: any
	label?: string
	disabled?: boolean
	style?: string
	className?: any
}

const Button = ({
  onClick,
  children,
  role,
  type,
  disabled = false,
  label,
  style = 'blue',
  className,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`text-sm ${styles.button} ${
        style === 'white' ? styles.buttonWhite : styles.buttonBlue
      } ${className ? className : ''}  `}
      role={role || undefined}
      type={type || undefined}
      aria-label={label || undefined}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button
