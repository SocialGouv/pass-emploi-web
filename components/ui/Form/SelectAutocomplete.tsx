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
}

const SelectAutocomplete = forwardRef<
  HTMLInputElement,
  SelectAutocompleteProps
>(
  (
    { disabled, id, invalid, multiple, onChange, options, required, onBlur },
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
        />
        <datalist id={`${id}--options`}>
          {options.map(({ id: optionId, value }) => (
            <option key={optionId} value={value}>
              {value}
            </option>
          ))}
        </datalist>
      </>
    )
  }
)
SelectAutocomplete.displayName = 'SelectAutocomplete'

export default SelectAutocomplete
