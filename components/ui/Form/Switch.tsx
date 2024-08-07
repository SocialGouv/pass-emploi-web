import { ChangeEvent } from 'react'

import styles from 'styles/components/Switch.module.css'

type SwitchProps = {
  id: string
  checked: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  checkedLabel?: string
  uncheckedLabel?: string
  disabled?: boolean
}

export function Switch({
  id,
  checked,
  disabled,
  checkedLabel = 'Oui',
  uncheckedLabel = 'Non',
  onChange,
}: SwitchProps) {
  return (
    <label className='cursor-pointer flex items-center'>
      <input
        id={id}
        type='checkbox'
        role='switch'
        checked={checked}
        disabled={disabled}
        className={styles.checkbox}
        onChange={onChange}
      />

      <span className={styles.toggle} />

      {checked && (
        <span aria-hidden={true} className='ml-3'>
          {checkedLabel}
        </span>
      )}
      {!checked && (
        <span aria-hidden={true} className='ml-3'>
          {uncheckedLabel}
        </span>
      )}
    </label>
  )
}
