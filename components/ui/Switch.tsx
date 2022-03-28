import styles from 'styles/components/Switch.module.css'
import { ChangeEvent } from 'react'

interface SwitchProps {
  id: string
  name: string
  checked: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export const Switch = ({ id, name, checked, onChange }: SwitchProps) => (
  <>
    <input
      type='checkbox'
      id={id}
      name={name}
      checked={checked}
      className={styles.checkbox}
      onChange={onChange}
    />
    <span className={styles.toggle}></span>
  </>
)
