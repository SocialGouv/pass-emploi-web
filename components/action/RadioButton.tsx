import { MouseEvent } from 'react'

interface RadioButtonProps {
  isSelected: boolean
  id: string
  label: string
  name: string
  onChange: () => void
  color?: string
}

export default function RadioButton({
  isSelected,
  onChange,
  id,
  label,
  name,
  color = 'primary',
}: RadioButtonProps) {
  function onClickDiv(e: MouseEvent) {
    e.preventDefault()
    onChange()
  }
  function onClickInput(e: MouseEvent) {
    e.stopPropagation()
    onChange()
  }

  const selectedStyle = `border-${color} bg-${color}_lighten text-${color}`

  return (
    <div
      className={`flex items-center px-4 py-2 border border-solid rounded-full text-s-bold mr-4 cursor-pointer ${
        isSelected ? selectedStyle : 'border-grey_800 text-grey_800'
      }`}
      onClick={onClickDiv}
    >
      <input
        type='radio'
        id={id}
        name={name}
        checked={isSelected}
        readOnly={true}
        required={true}
        className='mr-2'
        onClick={onClickInput}
      />
      <label htmlFor={id} className='whitespace-nowrap cursor-pointer'>
        {label}
      </label>
    </div>
  )
}
