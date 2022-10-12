import React from 'react'

import { Etape } from 'components/ui/Form/Etape'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'

type RechercheServicesCiviquesMainProps = {
  localitesOptions: Array<{ id: string; value: string }>
  localisationInput: {
    value?: string
    error?: string
  }
  onLocalisationInputChange: (value: string) => void
  validateLocalite: () => void
}
export default function RechercheServicesCiviquesMain({
  localitesOptions,
  localisationInput,
  onLocalisationInputChange,
  validateLocalite,
}: RechercheServicesCiviquesMainProps) {
  return (
    <Etape numero={2} titre='Critères de recherche'>
      <Label htmlFor='localisation'>
        {{
          main: 'Localisation',
          sub: 'Saisissez une ville',
        }}
      </Label>
      {localisationInput.error && (
        <InputError id='localisation--error'>
          {localisationInput.error}
        </InputError>
      )}
      <SelectAutocomplete
        id='localisation'
        options={localitesOptions}
        onChange={onLocalisationInputChange}
        onBlur={validateLocalite}
        invalid={Boolean(localisationInput.error)}
        value={localisationInput.value ?? ''}
      />
    </Etape>
  )
}
