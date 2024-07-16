type RadioBoxProps = {
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
  const selectedStyle = `border-${color} bg-${color}_lighten text-${color}`

  return (
    <label
      className={`flex items-center w-fit px-4 py-2 border border-solid rounded-l text-s-bold mr-4 ${
        isSelected ? selectedStyle : 'border-grey_800 text-grey_800'
      } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        type='radio'
        id={id}
        name={name}
        checked={isSelected}
        required={true}
        className='mr-2'
        onChange={onChange}
        disabled={disabled}
      />
      <span className='whitespace-nowrap'>{label}</span>
    </label>
  )
}
