import { forwardRef } from 'react'

import Input from 'components/ui/Form/Input'

interface SelectAutocompleteProps {
  options: { id: string; value: string }[]
  onChange: (value: string) => void
  id: string
  multiple?: boolean
  required?: boolean
  invalid?: boolean
  disabled?: boolean
  onBlur?: () => void
  value?: string
}

const SelectAutocomplete = forwardRef<
  HTMLInputElement,
  SelectAutocompleteProps
>(
  (
    {
      disabled,
      id,
      invalid,
      multiple,
      onChange,
      options,
      required,
      onBlur,
      value,
    },
    ref
  ) => {
    return (
      <>
        <Input
          type='text'
          id={id}
          ref={ref}
          list={`${id}--options`}
          multiple={multiple ?? false}
          aria-required={required}
          onChange={onChange}
          invalid={invalid}
          disabled={disabled}
          onBlur={onBlur}
          value={value}
        />
        <datalist id={`${id}--options`}>
          {options.map(({ id: optionId, value: optionValue }) => (
            <option key={optionId} value={optionValue}>
              {optionValue}
            </option>
          ))}
        </datalist>
      </>
    )
  }
)
SelectAutocomplete.displayName = 'SelectAutocomplete'

export default SelectAutocomplete
