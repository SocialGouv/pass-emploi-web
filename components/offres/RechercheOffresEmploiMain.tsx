import React from 'react'

import { Etape } from 'components/ui/Form/Etape'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import LocaliteSelectAutocomplete from 'components/ui/Form/LocaliteSelectAutocomplete'
import { Localite } from 'interfaces/referentiel'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'

type Query = SearchOffresEmploiQuery & { hasError: boolean }
type RechercheOffresEmploiMainProps = {
  fetchCommunesEtDepartements: (search: string) => Promise<Localite[]>
  query: Query
  onQueryUpdate: (query: Query) => void
}
const RAYON_DEFAULT = 10

export default function RechercheOffresEmploiMain({
  fetchCommunesEtDepartements,
  query,
  onQueryUpdate,
}: RechercheOffresEmploiMainProps) {
  function updateMotsCles(value: string) {
    onQueryUpdate({ ...query, motsCles: value })
  }

  function updateLocalite({
    localite,
    hasError,
  }: {
    localite: Localite | undefined
    hasError: boolean
  }) {
    const { rayon, commune, departement, ...autresCriteres } = query
    if (!localite) {
      onQueryUpdate({ ...autresCriteres, hasError })
      return
    }

    if (localite?.type === 'COMMUNE')
      onQueryUpdate({
        ...autresCriteres,
        hasError,
        commune: localite.code,
        rayon: rayon ?? RAYON_DEFAULT,
      })
    if (localite?.type === 'DEPARTEMENT')
      onQueryUpdate({
        ...autresCriteres,
        hasError,
        departement: localite.code,
      })
  }

  return (
    <Etape numero={2} titre='Critères de recherche'>
      <Label htmlFor='mots-cles'>Mots clés (Métier, code ROME)</Label>
      <Input type='text' id='mots-cles' onChange={updateMotsCles} />

      <Label htmlFor='localisation'>
        {{
          main: 'Lieu de travail',
          sub: 'Saisissez une ville ou un département',
        }}
      </Label>
      <LocaliteSelectAutocomplete
        fetchLocalites={fetchCommunesEtDepartements}
        onUpdateLocalite={updateLocalite}
      />
    </Etape>
  )
}
