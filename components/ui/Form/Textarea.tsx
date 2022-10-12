import { ChangeEvent, forwardRef } from 'react'

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
      onChange={onChange}
      onBlur={onBlur}
      maxLength={maxLength}
      rows={rows}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}--error` : undefined}
      className={`${styles.input} ${invalid ? 'invalid' : ''}`}
      ref={ref}
    />
  )
)

TextArea.displayName = 'TextArea'
export default TextArea
