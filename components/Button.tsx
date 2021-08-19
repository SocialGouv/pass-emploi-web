import styles from 'styles/components/Button.module.css'


type ButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>,
  children?:  React.ReactNode,
  type?: any
}

const Button = ({onClick, children, type =  'button'}: ButtonProps) => {
  return (
    <button onClick={onClick} className={`text-md ${styles.buttonBlue}`} type={type}> {children} </button>
  )
}

export default Button;



