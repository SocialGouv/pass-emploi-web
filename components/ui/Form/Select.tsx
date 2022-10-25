import { Key, ReactNode } from 'react'

import styles from 'styles/components/Input.module.css'

type SelectProps = {
  id: string
  onChange: (value: string) => void
  selectKey?: Key
  defaultValue?: string
  required?: boolean
  disabled?: boolean
  children: ReactNode
}

export default function Select({
  id,
  onChange,
  selectKey,
  defaultValue = '',
  required = false,
  disabled = false,
  children,
}: SelectProps) {
  return (
    <select
      key={selectKey}
      id={id}
      defaultValue={defaultValue}
      required={required}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`${styles.input} truncate`}
    >
      {required && <option aria-hidden hidden disabled value='' />}
      {!required && <option value='' />}
      {children}
    </select>
  )
}
