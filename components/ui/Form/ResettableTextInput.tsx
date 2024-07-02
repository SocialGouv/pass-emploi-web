import React, { ChangeEvent, ForwardedRef, forwardRef, MouseEvent } from 'react'

import IconComponent, { IconName } from '../IconComponent'

interface ResettableTextInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  onReset: () => void
  disabled?: boolean
  type?: string
  className?: string
  required?: boolean
  invalid?: boolean
}

const ResettableTextInput = forwardRef(
  (
    {
      id,
      value,
      onChange,
      onReset,
      disabled = false,
      type = 'text',
      className,
      required = false,
      invalid = false,
    }: ResettableTextInputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    function applyChange(e: ChangeEvent<HTMLInputElement>) {
      onChange(e.target.value)
    }

    function applyReset(e: MouseEvent<HTMLButtonElement>) {
      e.preventDefault()
      e.stopPropagation()

      onReset()
    }

    return (
      <div
        className={`flex flex-horizontal overflow-hidden bg-white ${
          className ?? ''
        } ${
          disabled
            ? 'cursor-not-allowed text-disabled border-disabled opacity-70'
            : ''
        }`}
      >
        <input
          type={type}
          id={id}
          name={id}
          ref={ref}
          value={value}
          onChange={applyChange}
          className='flex-1 p-3 bg-white rounded-l-base'
          disabled={disabled}
          required={required}
          aria-describedby={invalid ? id + '--error' : undefined}
          aria-invalid={invalid || undefined}
        />
        <button
          type='reset'
          className={`w-8 cursor-[inherit]`}
          onClick={applyReset}
          disabled={disabled}
        >
          <span className='sr-only'>Effacer le champ de saisie</span>
          <IconComponent
            name={IconName.Close}
            focusable={false}
            aria-hidden={true}
            className='w-6 h-6 cursor-pointer'
            fill='currentColor'
            title='Effacer'
          />
        </button>
      </div>
    )
  }
)
ResettableTextInput.displayName = 'ResettableTextInput'

export default ResettableTextInput
