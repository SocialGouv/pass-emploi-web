import { ReactNode } from 'react'

type SelectProps = {
  id: string
  onChange: (value: string) => void
  defaultValue?: string
  required?: boolean
  disabled?: boolean
  children: ReactNode
}

export default function Select({
  id,
  onChange,
  defaultValue = '',
  required = false,
  disabled = false,
  children,
}: SelectProps) {
  return (
    <select
      id={id}
      defaultValue={defaultValue}
      required={required}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className='border border-solid border-content_color rounded-medium w-full px-4 py-3 mb-8 truncate disabled:bg-grey_100'
    >
      {required && <option aria-hidden hidden disabled value='' />}
      {!required && <option value='' />}
      {children}
    </select>
  )
}
