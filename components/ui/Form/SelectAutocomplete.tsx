import { ChangeEventHandler, forwardRef } from 'react'

interface SelectAutocompleteProps {
  options: { id: string; value: string }[]
  onChange: ChangeEventHandler<HTMLInputElement>
  id: string
  className?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  multiple?: boolean
  required?: boolean
  disabled?: boolean
  'aria-required'?: boolean
}

const SelectAutocomplete = forwardRef<
  HTMLInputElement,
  SelectAutocompleteProps
>((props, ref) => {
  return (
    <>
      <input
        type='text'
        id={props.id}
        ref={ref}
        list={`${props.id}--options`}
        multiple={props.multiple ?? false}
        required={props.required ?? false}
        aria-required={props['aria-required']}
        onChange={props.onChange}
        aria-invalid={props['aria-invalid']}
        aria-describedby={props['aria-describedby']}
        className={props.className}
        disabled={props.disabled}
      />
      <datalist id={`${props.id}--options`}>
        {props.options.map(({ id, value }) => (
          <option key={id} value={value}>
            {value}
          </option>
        ))}
      </datalist>
    </>
  )
})
SelectAutocomplete.displayName = 'SelectAutocomplete'

export default SelectAutocomplete
