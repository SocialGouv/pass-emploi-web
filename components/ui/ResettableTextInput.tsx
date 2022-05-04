import React, { ChangeEvent, MouseEvent } from 'react'

import CloseIcon from '../../assets/icons/close.svg'

interface ResettableTextInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  onReset: () => void
  disabled?: boolean
  type?: string
  roundedRight?: boolean
}

function ResettableTextInput({
  id,
  value,
  onChange,
  onReset,
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
        name={id}
        value={value}
        onChange={applyChange}
        className={`flex-1 p-3 w-8/12 border border-solid border-r-0 border-grey_700 rounded-l-medium text-base-medium text-bleu_nuit bg-blanc disabled:cursor-not-allowed disabled:border-disabled disabled:text-disabled`}
        disabled={disabled}
      />
      <button
        type='reset'
        title='Effacer'
        className={`border border-solid ${
          roundedRight ? 'rounded-r-medium' : 'border-r-0'
        } border-l-0 border-grey_700 w-8 text-bleu_nuit disabled:border-disabled disabled:cursor-not-allowed`}
        onClick={applyReset}
        disabled={disabled}
      >
        <span className='sr-only'>Effacer le champ de saisie</span>
        <CloseIcon
          className={`text-bleu_nuit ${disabled ? 'fill-disabled' : ''}`}
          focusable={false}
          aria-hidden={true}
        />
      </button>
    </>
  )
}

export default ResettableTextInput
