import React, { ChangeEvent, MouseEvent } from 'react'
import CloseIcon from '../assets/icons/close.svg'

interface ResettableTextInputProps {
  id: string
  onChange: (value: string) => void
  onReset: () => void
  disabled?: boolean
  type?: string
  roundedRight?: boolean
}

function ResettableTextInput({
  onReset,
  onChange,
  id,
  disabled = false,
  type = 'text',
  roundedRight = true,
}: ResettableTextInputProps) {
  function applyChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value)
  }

  function applyReset(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()

    onReset()
  }

  return (
    <>
      <input
        type={type}
        id={id}
        onChange={applyChange}
        className={`flex-1 p-3 w-8/12 border border-r-0 border-neutral_grey rounded-l-medium text-base-medium text-primary_primary disabled:cursor-not-allowed`}
        disabled={disabled}
      />
      <button
        type='reset'
        title='Effacer'
        className={`border ${
          roundedRight ? 'rounded-r-medium' : 'border-r-0'
        } border-l-0 border-neutral_grey w-8 text-primary_primary disabled:border-[#999BB3] disabled:cursor-not-allowed`}
        onClick={applyReset}
        disabled={disabled}
      >
        <span className='visually-hidden'>Effacer le champ de saisie</span>
        <CloseIcon
          className={`text-primary_primary ${disabled ? 'fill-[#999BB3]' : ''}`}
          focusable={false}
          aria-hidden={true}
        />
      </button>
    </>
  )
}

export default ResettableTextInput
