import styles from 'styles/components/Button.module.css'

type ButtonProps = {
	onClick?: React.MouseEventHandler<HTMLButtonElement>
	children?: React.ReactNode
	type?: any
	disabled?: boolean
	style?: string
	className?: any
}

const Button = ({
	onClick,
	children,
	type = 'button',
	disabled = false,
	style = 'blue',
	className,
}: ButtonProps) => {
	return (
		<button
			onClick={onClick}
			className={`text-sm ${styles.button} ${
				style === 'white' ? styles.buttonWhite : styles.buttonBlue
			} ${className ? className : ''}  `}
			type={type}
			disabled={disabled}
		>
			{children}
		</button>
	)
}

export default Button
