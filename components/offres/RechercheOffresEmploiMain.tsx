import React from 'react'

import { Etape } from 'components/ui/Form/Etape'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'

type RechercheOffresEmploiMainProps = {
  localitesOptions: Array<{ id: string; value: string }>
  localisationInput: {
    value?: string
    error?: string
  }
  onLocalisationInputChange: (value: string) => void
  validateLocalite: () => void
  query: SearchOffresEmploiQuery
  onQueryUpdate: (query: SearchOffresEmploiQuery) => void
}
export default function RechercheOffresEmploiMain({
  localitesOptions,
  localisationInput,
  onLocalisationInputChange,
  validateLocalite,
  query,
  onQueryUpdate,
}: RechercheOffresEmploiMainProps) {
  function setMotsCles(value: string) {
    onQueryUpdate({ ...query, motsCles: value })
  }

  return (
    <Etape numero={2} titre='Critères de recherche'>
      <Label htmlFor='mots-cles'>Mots clés (Métier, code ROME)</Label>
      <Input type='text' id='mots-cles' onChange={setMotsCles} />

      <Label htmlFor='localisation'>
        {{
          main: 'Lieu de travail',
          sub: 'Saisissez une ville ou un département',
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
