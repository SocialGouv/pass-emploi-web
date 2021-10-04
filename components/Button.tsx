import styles from 'styles/components/Button.module.css'

type ButtonProps = {
	onClick?: React.MouseEventHandler<HTMLButtonElement>
	children?: React.ReactNode
	type?: any
	disabled?: boolean
	className?: any
}

const Button = ({
	onClick,
	children,
	type = 'button',
	disabled = false,
	className,
}: ButtonProps) => {
	return (
		<button
			onClick={onClick}
			className={`text-sm ${styles.buttonBlue} ${className ? className : ''}`}
			type={type}
			disabled={disabled}
		>
			{children}
		</button>
	)
}

export default Button
