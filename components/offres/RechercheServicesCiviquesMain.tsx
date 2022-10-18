import React from 'react'

import { Etape } from 'components/ui/Form/Etape'
import Label from 'components/ui/Form/Label'
import SelectAutocompleteWithFetch from 'components/ui/Form/SelectAutocompleteWithFetch'
import { Commune, Localite } from 'interfaces/referentiel'
import { SearchServicesCiviquesQuery } from 'services/services-civiques.service'

type Query = SearchServicesCiviquesQuery & { hasError: boolean }
type RechercheServicesCiviquesMainProps = {
  fetchCommunes: (search: string) => Promise<Commune[]>
  query: Query
  onQueryUpdate: (query: Query) => void
}
const RAYON_DEFAULT = 10

export default function RechercheServicesCiviquesMain({
  fetchCommunes,
  query,
  onQueryUpdate,
}: RechercheServicesCiviquesMainProps) {
  function updateCommune({
    selected,
    hasError,
  }: {
    selected?: Localite
    hasError: boolean
  }) {
    const { commune, rayon, ...autresCriteres } = query
    if (selected) {
      onQueryUpdate({
        ...autresCriteres,
        hasError,
        commune: selected as Commune,
        rayon: rayon ?? RAYON_DEFAULT,
      })
    } else {
      onQueryUpdate({ ...autresCriteres, hasError })
    }
  }

  return (
    <Etape numero={2} titre='Critères de recherche'>
      <Label htmlFor='localisation'>
        {{
          main: 'Localisation',
          sub: 'Saisissez une ville',
        }}
      </Label>
      <SelectAutocompleteWithFetch<Localite>
        id='localisation'
        fetch={fetchCommunes}
        fieldNames={{ id: 'code', value: 'libelle' }}
        onUpdateSelected={updateCommune}
        errorMessage='Veuillez saisir une commune correcte.'
        value={query.commune?.libelle}
      />
    </Etape>
  )
}
