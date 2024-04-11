import { ComponentPropsWithoutRef } from 'react'

import styles from 'styles/components/Input.module.css'

type SelectProps = Omit<ComponentPropsWithoutRef<'select'>, 'onChange'> & {
  invalid?: boolean
  onChange: (value: string) => void
}

export default function Select({
  id,
  onChange,
  defaultValue = '',
  required = false,
  disabled = false,
  onBlur,
  children,
  invalid,
  ...props
}: SelectProps) {
  return (
    <div className='relative select'>
      <select
        id={id}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${styles.input} truncate ${invalid ? styles.invalid : ''}`}
        onBlur={onBlur}
        aria-describedby={invalid ? id + '--error' : undefined}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {required && <option aria-hidden hidden disabled value='' />}
        {!required && <option value='' />}
        {children}
      </select>
    </div>
  )
}
