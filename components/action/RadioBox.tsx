type RadioBoxProps = {
  isSelected: boolean
  label: string
  name: string
  onChange: () => void
  color?: string
  disabled?: boolean
}

export default function RadioBox({
  isSelected,
  onChange,
  label,
  name,
  color = 'primary',
  disabled,
}: RadioBoxProps) {
  const selectedStyle = `border-${color} bg-${color}_lighten text-${color}`

  return (
    <label
      className={`flex items-center w-fit px-4 py-2 border border-solid rounded-l text-s-bold mr-4 ${
        isSelected ? selectedStyle : 'border-grey_800 text-grey_800'
      } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        type='radio'
        name={name}
        checked={isSelected}
        required={true}
        readOnly={true}
        className='mr-2'
        onClick={onChange}
        disabled={disabled}
      />
      <span>{label}</span>
    </label>
  )
}
