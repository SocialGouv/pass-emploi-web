import { DateTime } from 'luxon'
import React, { useEffect } from 'react'

import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import { Switch } from 'components/ui/Form/Switch'
import { domainesServiceCivique } from 'referentiel/domaines-service-civique'
import { SearchServicesCiviquesQuery } from 'services/services-civiques.service'
import { FormValues } from 'types/form'
import { DATE_DASH_SEPARATOR } from 'utils/date'

type RechercheServicesCiviquesSecondaryProps = {
  onCriteresChange: (nbCriteres: number) => void
  query: FormValues<SearchServicesCiviquesQuery>
  onQueryUpdate: (query: FormValues<SearchServicesCiviquesQuery>) => void
}

export default function RechercheServicesCiviquesSecondary({
  onCriteresChange,
  query,
  onQueryUpdate,
}: RechercheServicesCiviquesSecondaryProps) {
  const RAYON_MIN = 0
  const RAYON_MAX = 100

  function updateDomaine(domaine: string) {
    onQueryUpdate({ ...query, domaine })
  }

  function toggleDateDebut() {
    if (query.dateDebut) {
      onQueryUpdate({ ...query, dateDebut: undefined })
    } else {
      onQueryUpdate({ ...query, dateDebut: DateTime.now() })
    }
  }

  function updateDateDebut(value: string) {
    onQueryUpdate({ ...query, dateDebut: DateTime.fromISO(value) })
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
              value={query.dateDebut.toFormat(DATE_DASH_SEPARATOR)}
              onChange={updateDateDebut}
            />
          </>
        )}
      </fieldset>

      {query.rayon !== undefined && (
        <fieldset className='mt-8 w-full'>
          <legend className='text-base-bold mb-4'>Distance</legend>
          <label htmlFor='distance'>
            Dans un rayon de :{' '}
            <span className='text-base-bold'>{query.rayon}km</span>
          </label>
          <Input
            id='distance'
            type='range'
            className='block mt-4 w-full'
            value={query.rayon}
            min={RAYON_MIN}
            max={RAYON_MAX}
            onChange={(value: string) => updateRayon(parseInt(value, 10))}
            list='distance-bornes'
          />
          <datalist id='distance-bornes' className='flex justify-between'>
            <option value='0' label='0km' className='text-s-bold' />
            <option value='100' label='100km' className='text-s-bold' />
          </datalist>
        </fieldset>
      )}
    </fieldset>
  )
}
