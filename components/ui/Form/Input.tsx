import { ComponentPropsWithoutRef, forwardRef } from 'react'

import styles from 'styles/components/Input.module.css'

type InputProps = Omit<ComponentPropsWithoutRef<'input'>, 'onChange'> & {
  onChange: (value: string) => void
  invalid?: boolean
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
        defaultValue={defaultValue || undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-describedby={invalid ? id + '--error' : undefined}
        aria-invalid={invalid || undefined}
        className={`text-base-medium ${styles.input} ${
          invalid ? styles.invalid : ''
        }`}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export default Input
