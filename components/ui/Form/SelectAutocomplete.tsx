import { forwardRef } from 'react'

import Input from 'components/ui/Form/Input'

export type OptionAutocomplete = {
  id: string
  value: string
  optgroupLabel: string
}

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
    const groupedOptions: Record<string, OptionAutocomplete[]> = {}
    options.forEach((option) => {
      if (!groupedOptions[option.optgroupLabel]) {
        groupedOptions[option.optgroupLabel] = []
      }
      groupedOptions[option.optgroupLabel].push(option)
    })
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
          {Object.entries(groupedOptions).map(
            ([optgroupLabel, groupedOpts]) => (
              <optgroup label={optgroupLabel} key={optgroupLabel}>
                {groupedOpts.map(({ id: optionId, value: optionValue }) => (
                  <option key={optionId} value={optionValue}>
                    {optionValue}
                  </option>
                ))}
              </optgroup>
            )
          )}
        </datalist>
      </>
    )
  }
)
SelectAutocomplete.displayName = 'SelectAutocomplete'

export default SelectAutocomplete
