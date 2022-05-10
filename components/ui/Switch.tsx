import { ChangeEvent } from 'react'

import styles from 'styles/components/Switch.module.css'

interface SwitchProps {
  id: string
  name: string
  checked: boolean
  checkedLabel?: string
  uncheckedLabel?: string
  disabled?: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export const Switch = ({
  id,
  name,
  checked,
  disabled,
  checkedLabel = 'Oui',
  uncheckedLabel = 'Non',
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
    {checked && <p className='ml-3'>{checkedLabel}</p>}
    {!checked && <p className='ml-3'>{uncheckedLabel}</p>}
  </>
)
