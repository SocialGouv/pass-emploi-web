import { ComponentPropsWithoutRef } from 'react'

type InputProps = ComponentPropsWithoutRef<any> & {
  type: string
  id: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
  defaultValue?: string
  onBlur?: () => void
  invalid?: boolean
}

export default function Input({
  type,
  id,
  onChange,
  onBlur,
  defaultValue = '',
  required = false,
  disabled = false,
  invalid = false,
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      id={id}
      required={required}
      disabled={disabled}
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}--error` : undefined}
      className={`border border-solid rounded-medium w-full px-4 py-3 mb-4 disabled:bg-grey_100 ${
        invalid ? 'border-warning text-warning' : 'border-content_color'
      }`}
      {...props}
    />
  )
}
