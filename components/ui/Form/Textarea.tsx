import { forwardRef } from 'react'

import styles from 'styles/components/Input.module.css'

type TextareaProps = {
  id: string
  onChange: (value: string) => void
  rows: number
  required?: boolean
  disabled?: boolean
  defaultValue?: string
  maxLength?: number
  onBlur?: () => void
  invalid?: boolean
}

const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      onChange,
      rows,
      defaultValue = '',
      required = false,
      disabled = false,
      invalid = false,
      onBlur,
      maxLength,
    },
    ref
  ) => (
    <textarea
      id={id}
      required={required}
      disabled={disabled}
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      maxLength={maxLength}
      rows={rows}
      aria-describedby={invalid ? `${id}--error` : undefined}
      aria-invalid={invalid || undefined}
      className={`${styles.input}  ${invalid ? styles.invalid : ''}`}
      ref={ref}
    />
  )
)

TextArea.displayName = 'TextArea'
export default TextArea
