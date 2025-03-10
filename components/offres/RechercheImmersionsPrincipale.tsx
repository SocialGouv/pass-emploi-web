import React from 'react'

import Etape from 'components/ui/Form/Etape'
import InputError from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import SelectAutocompleteWithFetch from 'components/ui/Form/SelectAutocompleteWithFetch'
import { Commune, Metier } from 'interfaces/referentiel'
import { SearchImmersionsQuery } from 'services/immersions.service'
import { FormValues } from 'types/form'

type RechercheImmersionsPrincipaleProps = {
  recupererMetiers: (search: string) => Promise<Metier[]>
  recupererCommunes: (search: string) => Promise<Commune[]>
  query: FormValues<SearchImmersionsQuery>
  onQueryUpdate: (query: FormValues<SearchImmersionsQuery>) => void
}

export default function RechercheImmersionsPrincipale({
  recupererMetiers,
  recupererCommunes,
  query,
  onQueryUpdate,
}: RechercheImmersionsPrincipaleProps) {
  function updateMetier({ selected }: { selected?: Metier }) {
    const { metier, ...autresCriteres } = query
    onQueryUpdate({
      ...autresCriteres,
      metier: { value: selected },
      hasError: !selected || !query.commune?.value,
    })
  }

  function updateCommune({ selected }: { selected?: Commune }) {
    const { commune, ...autresCriteres } = query
    onQueryUpdate({
      ...autresCriteres,
      commune: { value: selected },
      hasError: !selected || !query.metier?.value,
    })
  }

  return (
    <Etape numero={2} titre='Critères de recherche'>
      <Label htmlFor='metier' inputRequired={true}>
        Métier
      </Label>
      {query.metier?.error && (
        <InputError id='metier--error' className='mt-2'>
          {query.metier.error}
        </InputError>
      )}
      <SelectAutocompleteWithFetch<Metier>
        id='metier'
        fetch={recupererMetiers}
        fieldNames={{ id: 'libelle', value: 'libelle' }}
        onUpdateSelected={updateMetier}
        errorMessage=''
        defaultValue={query.metier?.value?.libelle}
        required={true}
      />

      <Label htmlFor='communes' inputRequired={true}>
        {{
          main: 'Localisation',
          helpText: 'Saisissez une ville',
        }}
      </Label>
      {query.commune?.error && (
        <InputError id='metier--error' className='mt-2'>
          {query.commune.error}
        </InputError>
      )}
      <SelectAutocompleteWithFetch<Commune>
        id='communes'
        fetch={recupererCommunes}
        fieldNames={{ id: 'code', value: 'libelle' }}
        onUpdateSelected={updateCommune}
        errorMessage=''
        defaultValue={query.commune?.value?.libelle}
        required={true}
      />
    </Etape>
  )
}
