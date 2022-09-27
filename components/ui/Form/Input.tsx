import { ComponentPropsWithoutRef, forwardRef } from 'react'

import styles from 'styles/components/Input.module.css'

type InputProps = ComponentPropsWithoutRef<any> & {
  type: string
  id: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
  defaultValue?: string
  onBlur?: () => void
  invalid?: boolean
  icon?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type,
      id,
      onChange,
      onBlur,
      defaultValue = '',
      required = false,
      disabled = false,
      invalid = false,
      icon,
      ...props
    },
    ref
  ) => {
    return (
      <input
        type={type}
        id={id}
        required={required}
        disabled={disabled}
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-describedby={invalid ? `${id}--error` : undefined}
        aria-invalid={invalid || undefined}
        className={`${styles.input} ${invalid ? styles.invalid : ''} ${
          icon
            ? `bg-${icon} bg-[center_right_1rem] bg-[length:24px_24px] bg-no-repeat`
            : ''
        }`}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export default Input
