import styles from 'styles/components/Switch.module.css'
import { ChangeEvent } from 'react'

interface SwitchProps {
  id: string
  name: string
  checked: boolean
  disabled?: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export const Switch = ({
  id,
  name,
  checked,
  disabled,
  onChange,
}: SwitchProps) => (
  <>
    <input
      type='checkbox'
      id={id}
      name={name}
      checked={checked}
      disabled={disabled}
      className={styles.checkbox}
      onChange={onChange}
    />
    <span className={styles.toggle}></span>
  </>
)
