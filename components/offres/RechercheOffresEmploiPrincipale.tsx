import React, { useState } from 'react'

import Checkbox from 'components/offres/Checkbox'
import Etape from 'components/ui/Form/Etape'
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
  onRechercheParIdOffre: (value: boolean) => void
}
const RAYON_DEFAULT = 10

export default function RechercheOffresEmploiPrincipale({
  recupererCommunesEtDepartements,
  query,
  onQueryUpdate,
  onRechercheParIdOffre,
}: RechercheOffresEmploiPrincipaleProps) {
  const [isSearchByIdOffre, setSearchByIdOffre] = useState<boolean>(false)

  function toggleRechercheParIdOffre() {
    updateIdOffre('')

    const rechercheParId = !isSearchByIdOffre
    onRechercheParIdOffre(rechercheParId)
    setSearchByIdOffre(rechercheParId)
  }

  function updateIdOffre(value: string) {
    onQueryUpdate({ ...query, idOffre: value })
  }

  function updateMotsCles(value: string) {
    if (!isSearchByIdOffre) {
      onQueryUpdate({ ...query, motsCles: value })
    }
  }

  function updateLocalite({
    selected,
    hasError,
  }: {
    selected?: Localite
    hasError: boolean
  }) {
    if (isSearchByIdOffre) return

    const { rayon, commune, departement, ...autresCriteres } = query
    if (!selected) {
      onQueryUpdate({ ...autresCriteres, hasError })
      return
    }

    if (selected?.type === 'COMMUNE')
      onQueryUpdate({
        ...autresCriteres,
        hasError,
        commune: selected,
        rayon: rayon ?? RAYON_DEFAULT,
      })
    if (selected?.type === 'DEPARTEMENT')
      onQueryUpdate({
        ...autresCriteres,
        hasError,
        departement: selected,
      })
  }

  return (
    <Etape numero={2} titre='Critères de recherche'>
      <div className='mt-2 mb-6'>
        <Checkbox
          id='recherche-par-id-offre'
          label='Recherche avec un numéro d’offre France Travail'
          value='searchByIdOffre'
          checked={isSearchByIdOffre}
          onChange={toggleRechercheParIdOffre}
        />
      </div>

      {isSearchByIdOffre && (
        <>
          <Label
            htmlFor='id-offre'
            inputRequired={isSearchByIdOffre ? true : false}
          >
            Numéro d’offre
          </Label>
          <Input
            type='text'
            id='id-offre'
            required={isSearchByIdOffre ? true : false}
            value={query.idOffre ?? ''}
            onChange={updateIdOffre}
          />
        </>
      )}

      <Label htmlFor='mots-cles'>Mots clés (Métier, code ROME)</Label>
      <Input
        type='text'
        id='mots-cles'
        value={query.motsCles ?? ''}
        onChange={updateMotsCles}
        disabled={isSearchByIdOffre}
      />

      <Label htmlFor='localites'>
        {{
          main: 'Lieu de travail',
          helpText: 'Saisissez une ville ou un département',
        }}
      </Label>
      <SelectAutocompleteWithFetch<Localite>
        id='localites'
        fetch={recupererCommunesEtDepartements}
        fieldNames={{ id: 'code', value: 'libelle' }}
        onUpdateSelected={updateLocalite}
        errorMessage='Veuillez saisir une localisation correcte.'
        defaultValue={query.commune?.libelle ?? query.departement?.libelle}
        disabled={isSearchByIdOffre}
      />
    </Etape>
  )
}
