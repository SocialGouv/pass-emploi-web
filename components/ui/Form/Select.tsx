import { ReactNode } from 'react'

import styles from 'styles/components/Input.module.css'

type SelectProps = {
  id: string
  onChange: (value: string) => void
  defaultValue?: string
  required?: boolean
  disabled?: boolean
  onBlur?: () => void
  children: ReactNode
}

export default function Select({
  id,
  onChange,
  defaultValue = '',
  required = false,
  disabled = false,
  onBlur,
  children,
}: SelectProps) {
  return (
    <select
      id={id}
      defaultValue={defaultValue}
      required={required}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`${styles.input} truncate`}
      onBlur={onBlur}
    >
      {required && <option aria-hidden hidden disabled value='' />}
      {!required && <option value='' />}
      {children}
    </select>
  )
}
