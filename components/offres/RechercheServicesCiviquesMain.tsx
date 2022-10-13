import React from 'react'

import { Etape } from 'components/ui/Form/Etape'
import Label from 'components/ui/Form/Label'
import LocaliteSelectAutocomplete from 'components/ui/Form/LocaliteSelectAutocomplete'
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
  function updateCoordonnees({
    localite,
    hasError,
  }: {
    localite: Localite | undefined
    hasError: boolean
  }) {
    const { coordonnees, rayon, ...autresCriteres } = query
    if (localite) {
      const commune = localite as Commune
      onQueryUpdate({
        ...autresCriteres,
        hasError,
        coordonnees: { lon: commune.longitude, lat: commune.latitude },
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
      <LocaliteSelectAutocomplete
        fetchLocalites={fetchCommunes}
        onUpdateLocalite={updateCoordonnees}
      />
    </Etape>
  )
}
