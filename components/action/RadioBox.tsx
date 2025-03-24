type RadioBoxProps = {
  id: string
  isSelected: boolean
  label: string
  name: string
  onChange: () => void
  disabled?: boolean
  className?: string
}

export default function RadioBox({
  id,
  isSelected,
  onChange,
  label,
  name,
  disabled,
  className,
}: RadioBoxProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center w-fit px-4 py-2 border border-solid rounded-large text-s-bold ${
        isSelected
          ? 'border-primary bg-primary-lighten text-primary'
          : 'border-grey-800 text-grey-800'
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
