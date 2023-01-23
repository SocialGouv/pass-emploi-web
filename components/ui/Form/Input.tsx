import { ComponentPropsWithoutRef, forwardRef } from 'react'

import styles from 'styles/components/Input.module.css'

type InputProps = Omit<ComponentPropsWithoutRef<'input'>, 'onChange'> & {
  onChange: (value: string) => void
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
        defaultValue={defaultValue || undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-describedby={invalid ? `${id}--error` : undefined}
        aria-invalid={invalid || undefined}
        className={`text-base-medium ${styles.input} ${
          invalid ? styles.invalid : ''
        } ${
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
