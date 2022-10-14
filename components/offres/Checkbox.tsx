import React from 'react'

type CheckboxProps = {
  id: string
  value: string
  onChange: (value: string) => void
  label: string
  checked: boolean
}
export default function Checkbox({
  checked,
  id,
  label,
  onChange,
  value,
}: CheckboxProps) {
  return (
    <label htmlFor={id} className='flex w-fit'>
      <input
        type='checkbox'
        value={value}
        id={id}
        checked={checked}
        className='h-6 w-6 mr-5'
        onChange={(e) => onChange(e.target.value)}
      />
      {label}
    </label>
  )
}
