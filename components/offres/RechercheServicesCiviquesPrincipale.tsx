import React from 'react'

import Etape from 'components/ui/Form/Etape'
import Label from 'components/ui/Form/Label'
import SelectAutocompleteWithFetch from 'components/ui/Form/SelectAutocompleteWithFetch'
import { Commune } from 'interfaces/referentiel'
import { SearchServicesCiviquesQuery } from 'services/services-civiques.service'
import { FormValues } from 'types/form'

type RechercheServicesCiviquesPrincipaleProps = {
  recupererCommunes: (search: string) => Promise<Commune[]>
  query: FormValues<SearchServicesCiviquesQuery>
  onQueryUpdate: (query: FormValues<SearchServicesCiviquesQuery>) => void
}
const RAYON_DEFAULT = 10

export default function RechercheServicesCiviquesPrincipale({
  recupererCommunes,
  query,
  onQueryUpdate,
}: RechercheServicesCiviquesPrincipaleProps) {
  function updateCommune({
    selected,
    hasError,
  }: {
    selected?: Commune
    hasError: boolean
  }) {
    const { commune, rayon, ...autresCriteres } = query
    if (selected) {
      onQueryUpdate({
        ...autresCriteres,
        hasError,
        commune: selected,
        rayon: rayon ?? RAYON_DEFAULT,
      })
    } else {
      onQueryUpdate({ ...autresCriteres, hasError })
    }
  }

  return (
    <Etape numero={2} titre='Critères de recherche'>
      <Label htmlFor='communes'>
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
        defaultValue={query.commune?.libelle}
      />
    </Etape>
  )
}
