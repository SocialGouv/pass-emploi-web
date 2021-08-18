import styles from 'styles/components/Button.module.css'


type ButtonProps = {
  onClick: React.MouseEventHandler<HTMLButtonElement>,
  children?:  React.ReactNode,
}

const Button = ({onClick, children}: ButtonProps) => {
  return (
    <button onClick={onClick} className={`text-md ${styles.buttonBlue}`}> {children} </button>
  )
}

export default Button;



