import { ChangeEvent } from 'react'

import styles from 'styles/components/Input.module.css'

type TextareaProps = {
  id: string
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  rows: number
  required?: boolean
  disabled?: boolean
  defaultValue?: string
  maxLength?: number
  onBlur?: () => void
  invalid?: boolean
}

export default function Textarea({
  id,
  onChange,
  rows,
  defaultValue = '',
  required = false,
  disabled = false,
  invalid = false,
  onBlur,
  maxLength,
}: TextareaProps) {
  return (
    <textarea
      id={id}
      required={required}
      disabled={disabled}
      defaultValue={defaultValue}
      onChange={onChange}
      onBlur={onBlur}
      maxLength={maxLength}
      rows={rows}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}--error` : undefined}
      className={`${styles.input} ${invalid ? 'invalid' : ''}`}
    />
  )
}
