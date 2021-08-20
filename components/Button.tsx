import styles from 'styles/components/Button.module.css'


type ButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>,
  children?:  React.ReactNode,
  type?: any
  disabled?: boolean
}

const Button = ({onClick, children, type =  'button', disabled = false}: ButtonProps) => {
  return (
    <button onClick={onClick} className={`text-md ${styles.buttonBlue}`} type={type} disabled={disabled}> {children} </button>
  )
}

export default Button;



