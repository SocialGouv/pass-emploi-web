import { DateTime } from 'luxon'
import React, { useEffect } from 'react'

import { DistanceRange } from 'components/offres/DistanceRange'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import { Switch } from 'components/ui/Form/Switch'
import { domainesServiceCivique } from 'referentiel/domaines-service-civique'
import { SearchServicesCiviquesQuery } from 'services/services-civiques.service'
import { FormValues } from 'types/form'
import { DATE_DASH_SEPARATOR } from 'utils/date'

type RechercheServicesCiviquesSecondaireProps = {
  onCriteresChange: (nbCriteres: number) => void
  query: FormValues<SearchServicesCiviquesQuery>
  onQueryUpdate: (query: FormValues<SearchServicesCiviquesQuery>) => void
}

export default function RechercheServicesCiviquesSecondaire({
  onCriteresChange,
  query,
  onQueryUpdate,
}: RechercheServicesCiviquesSecondaireProps) {
  function updateDomaine(domaine: string) {
    onQueryUpdate({ ...query, domaine })
  }

  function toggleDateDebut() {
    if (query.dateDebut) {
      onQueryUpdate({ ...query, dateDebut: undefined })
    } else {
      onQueryUpdate({
        ...query,
        dateDebut: DateTime.now().toFormat(DATE_DASH_SEPARATOR),
      })
    }
  }

  function updateDateDebut(dateDebut: string) {
    onQueryUpdate({ ...query, dateDebut })
  }

  function updateRayon(rayon: number) {
    onQueryUpdate({ ...query, rayon })
  }

  useEffect(() => {
    let nbCriteres = 0
    if (query.domaine) nbCriteres++
    if (query.dateDebut) nbCriteres++
    if (query.rayon) nbCriteres++
    onCriteresChange(nbCriteres)
  }, [onCriteresChange, query])

  return (
    <fieldset className='w-1/2 min-w-[300px]'>
      <legend className='sr-only'>Étape 3 Plus de critères</legend>
      <Label htmlFor='domaine'>Sélectionner domaine</Label>
      <Select
        id='domaine'
        onChange={updateDomaine}
        defaultValue={query.domaine}
      >
        {domainesServiceCivique.map((domaine) => (
          <option key={domaine.code} value={domaine.code}>
            {domaine.libelle}
          </option>
        ))}
      </Select>

      <fieldset>
        <legend className='text-base-bold mb-6'>Date de début</legend>
        <label htmlFor='des-que-possible' className='flex items-center mb-6'>
          <Switch
            id='des-que-possible'
            checked={!query.dateDebut}
            onChange={() => toggleDateDebut()}
          />
          <span className='ml-8'>Dès que possible</span>
        </label>
        <label htmlFor='a-partir-de' className='flex items-center '>
          <Switch
            id='a-partir-de'
            checked={Boolean(query.dateDebut)}
            onChange={() => {}}
            disabled
          />
          <span className='ml-8'>À partir de</span>
        </label>

        {query.dateDebut && (
          <>
            <Label htmlFor='date-debut'>Sélectionner une date de début</Label>
            <Input
              type='date'
              id='date-debut'
              value={query.dateDebut}
              onChange={updateDateDebut}
            />
          </>
        )}
      </fieldset>

      {query.rayon !== undefined && (
        <fieldset className='mt-8 w-full'>
          <legend className='text-base-bold mb-4'>Distance</legend>
          <DistanceRange value={query.rayon} onChange={updateRayon} />
        </fieldset>
      )}
    </fieldset>
  )
}
