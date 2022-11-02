import React from 'react'

import { Etape } from 'components/ui/Form/Etape'
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
    console.log('>>>', { metier: selected })
    const { metier, ...autresCriteres } = query
    onQueryUpdate({
      ...autresCriteres,
      metier: selected,
      hasError: !selected || !query.commune,
    })
  }

  function updateCommune({ selected }: { selected?: Commune }) {
    console.log('>>>', { commune: selected })
    const { commune, ...autresCriteres } = query
    onQueryUpdate({
      ...autresCriteres,
      commune: selected,
      hasError: !selected || !query.metier,
    })
  }

  return (
    <Etape numero={2} titre='Critères de recherche'>
      <Label htmlFor='metier' inputRequired={true}>
        Métier
      </Label>
      <SelectAutocompleteWithFetch<Metier>
        id='metier'
        fetch={recupererMetiers}
        fieldNames={{ id: 'libelle', value: 'libelle' }}
        onUpdateSelected={updateMetier}
        errorMessage='Veuillez saisir un métier correct.'
        value={query.metier?.libelle}
        required={true}
      />

      <Label htmlFor='communes' inputRequired={true}>
        {{
          main: 'Localisation',
          helpText: 'Saisissez une ville',
        }}
      </Label>
      <SelectAutocompleteWithFetch<Commune>
        id='communes'
        fetch={recupererCommunes}
        fieldNames={{ id: 'code', value: 'libelle' }}
        onUpdateSelected={updateCommune}
        errorMessage='Veuillez saisir une commune correcte.'
        value={query.commune?.libelle}
        required={true}
      />
    </Etape>
  )
}
