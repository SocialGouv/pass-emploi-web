type RadioBoxProps = {
  id: string
  isSelected: boolean
  label: string
  name: string
  onChange: () => void
  color?: string
  disabled?: boolean
  className?: string
}

export default function RadioBox({
  id,
  isSelected,
  onChange,
  label,
  name,
  color = 'primary',
  disabled,
  className,
}: RadioBoxProps) {
  const selectedStyle = `border-${color} bg-${color}_lighten text-${color}`

  return (
    <label
      htmlFor={id}
      className={`flex items-center w-fit px-4 py-2 border border-solid rounded-l text-s-bold ${
        isSelected ? selectedStyle : 'border-grey_800 text-grey_800'
      } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className ?? ''}`}
    >
      <input
        id={id}
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
