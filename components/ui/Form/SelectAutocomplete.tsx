import { forwardRef } from 'react'

import Input from 'components/ui/Form/Input'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'

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
  doitGrouperOptionParType?: boolean
  ariaDescribedBy?: string
  listsDeDiffusion?: ListeDeDiffusion[]
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
      doitGrouperOptionParType,
    },
    ref
  ) => {
    function getBeneficiaire() {
      return options.filter(
        (destinataire) => destinataire.estUneListe == undefined
      )
    }

    function getListesDeDiffusion() {
      return options.filter((destinataire) => destinataire.estUneListe)
    }

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

        {!estSelectMultiDestinataire && (
          <datalist id={`${id}--options`}>
            {options.map(({ id: optionId, value: optionValue }) => (
              <option key={optionId} value={optionValue}>
                {optionValue}
              </option>
            ))}
          </datalist>
        )}

        {estSelectMultiDestinataire && (
          <datalist id={`${id}--options`}>
            <optgroup label='Bénéficiaires'>
              {getBeneficiaire().map((beneficiaire) => (
                <option key={beneficiaire.id} value={beneficiaire.value}>
                  {value}
                </option>
              ))}
            </optgroup>
            <optgroup label='Listes de diffusion'>
              {getListesDeDiffusion().map((liste) => (
                <option key={liste.id} value={liste.value}>
                  {value}
                </option>
              ))}
            </optgroup>
          </datalist>
        )}
      </>
    )
  }
)
SelectAutocomplete.displayName = 'SelectAutocomplete'

export default SelectAutocomplete
