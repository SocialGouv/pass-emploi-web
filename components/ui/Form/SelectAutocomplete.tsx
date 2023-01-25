import { forwardRef } from 'react'

import Input from 'components/ui/Form/Input'

export type OptionAutocomplete = { id: string; value: string }

interface SelectAutocompleteProps {
  options: OptionAutocomplete[]
  onChange: (value: string) => void
  id: string
  multiple?: boolean
  required?: boolean
  invalid?: boolean
  disabled?: boolean
  onBlur?: () => void
  value?: string
  ariaDescribedBy?: string
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
      ariaDescribedBy,
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
          autoComplete='off'
          aria-autocomplete='list'
          aria-required={required}
          onChange={onChange}
          invalid={invalid}
          disabled={disabled}
          onBlur={onBlur}
          value={value}
          aria-describedby={invalid ? `${id}--error` : ariaDescribedBy}
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
