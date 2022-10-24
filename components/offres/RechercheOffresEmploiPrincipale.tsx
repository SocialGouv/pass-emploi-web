import React from 'react'

import { Etape } from 'components/ui/Form/Etape'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import SelectAutocompleteWithFetch from 'components/ui/Form/SelectAutocompleteWithFetch'
import { Localite } from 'interfaces/referentiel'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'
import { FormValues } from 'types/form'

type RechercheOffresEmploiPrincipaleProps = {
  recupererCommunesEtDepartements: (search: string) => Promise<Localite[]>
  query: FormValues<SearchOffresEmploiQuery>
  onQueryUpdate: (query: FormValues<SearchOffresEmploiQuery>) => void
}
const RAYON_DEFAULT = 10

export default function RechercheOffresEmploiPrincipale({
  recupererCommunesEtDepartements,
  query,
  onQueryUpdate,
}: RechercheOffresEmploiPrincipaleProps) {
  function updateMotsCles(value: string) {
    onQueryUpdate({ ...query, motsCles: value })
  }

  function updateLocalite({
    selected,
    hasError,
  }: {
    selected?: Localite
    hasError: boolean
  }) {
    const { rayon, commune, departement, ...autresCriteres } = query
    if (!selected) {
      onQueryUpdate({ ...autresCriteres, hasError })
      return
    }

    if (selected?.type === 'COMMUNE')
      onQueryUpdate({
        ...autresCriteres,
        hasError,
        commune: selected.code,
        rayon: rayon ?? RAYON_DEFAULT,
      })
    if (selected?.type === 'DEPARTEMENT')
      onQueryUpdate({
        ...autresCriteres,
        hasError,
        departement: selected.code,
      })
  }

  return (
    <Etape numero={2} titre='Critères de recherche'>
      <Label htmlFor='mots-cles'>Mots clés (Métier, code ROME)</Label>
      <Input
        type='text'
        id='mots-cles'
        value={query.motsCles ?? ''}
        onChange={updateMotsCles}
      />

      <Label htmlFor='localisation'>
        {{
          main: 'Lieu de travail',
          helpText: 'Saisissez une ville ou un département',
        }}
      </Label>
      <SelectAutocompleteWithFetch<Localite>
        id='localisation'
        fetch={recupererCommunesEtDepartements}
        fieldNames={{ id: 'code', value: 'libelle' }}
        onUpdateSelected={updateLocalite}
        errorMessage='Veuillez saisir une localisation correcte.'
        value={query.commune ?? query.departement}
      />
    </Etape>
  )
}
