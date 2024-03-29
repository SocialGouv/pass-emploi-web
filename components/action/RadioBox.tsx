import { MouseEvent } from 'react'

interface RadioBoxProps {
  isSelected: boolean
  id: string
  label: string
  name: string
  onChange: () => void
  color?: string
  disabled?: boolean
}

export default function RadioBox({
  isSelected,
  onChange,
  id,
  label,
  name,
  color = 'primary',
  disabled,
}: RadioBoxProps) {
  function onClickDiv(e: MouseEvent) {
    e.preventDefault()
    if (disabled) return
    onChange()
  }
  function onClickInput(e: MouseEvent) {
    e.stopPropagation()
  }

  const selectedStyle = `border-${color} bg-${color}_lighten text-${color}`

  return (
    <div
      className={`flex items-center w-fit px-4 py-2 border border-solid rounded-l text-s-bold mr-4 cursor-pointer ${
        isSelected ? selectedStyle : 'border-grey_800 text-grey_800'
      } ${disabled ? 'hover:cursor-not-allowed' : ''}`}
      onClick={onClickDiv}
    >
      <input
        type='radio'
        id={id}
        name={name}
        checked={isSelected}
        required={true}
        className='mr-2'
        onClick={onClickInput}
        onChange={onChange}
        disabled={disabled}
      />
      <label
        htmlFor={id}
        className={`whitespace-nowrap cursor-pointer ${
          disabled ? 'hover:cursor-not-allowed' : ''
        }`}
      >
        {label}
      </label>
    </div>
  )
}
