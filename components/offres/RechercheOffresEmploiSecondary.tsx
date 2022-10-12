import React, { useEffect } from 'react'

import Checkbox from 'components/offres/Checkbox'
import Input from 'components/ui/Form/Input'
import { Switch } from 'components/ui/Form/Switch'
import {
  Duree,
  SearchOffresEmploiQuery,
  TypeContrat,
} from 'services/offres-emploi.service'

type RechercheOffresEmploiSecondaryProps = {
  onCriteresChange: (nbCriteres: number) => void
  query: SearchOffresEmploiQuery
  onQueryUpdate: (query: SearchOffresEmploiQuery) => void
}

export default function RechercheOffresEmploiSecondary({
  onCriteresChange,
  query,
  onQueryUpdate,
}: RechercheOffresEmploiSecondaryProps) {
  const RAYON_MIN = 0
  const RAYON_MAX = 100

  function updateTypeContrat(type: TypeContrat) {
    const typesContrats = query.typesContrats ?? []
    const index = typesContrats.indexOf(type)
    if (index > -1) {
      typesContrats.splice(index, 1)
    } else {
      typesContrats.push(type)
    }
    onQueryUpdate({ ...query, typesContrats })
  }

  function updateDuree(duree: Duree) {
    const durees = query.durees ?? []
    const index = durees.indexOf(duree)
    if (index > -1) {
      durees.splice(index, 1)
    } else {
      durees.push(duree)
    }
    onQueryUpdate({ ...query, durees })
  }

  function updateExperience() {
    onQueryUpdate({ ...query, debutantAccepte: !query.debutantAccepte })
  }

  function updateRayon(value?: number) {
    onQueryUpdate({ ...query, rayon: value })
  }

  useEffect(() => {
    let nbCriteres = 0
    if (query.typesContrats?.length) nbCriteres++
    if (query.durees?.length) nbCriteres++
    if (query.debutantAccepte) nbCriteres++
    if (query.rayon !== undefined) nbCriteres++
    onCriteresChange(nbCriteres)
  }, [onCriteresChange, query])

  return (
    <fieldset>
      <legend className='sr-only'>Étape 3 Plus de critères</legend>

      <div className='flex mb-10'>
        <fieldset className='grow flex flex-col gap-y-8'>
          <legend className='contents text-base-bold'>Type de contrat</legend>

          <Checkbox
            id='contrat--cdi'
            label='CDI'
            value='CDI'
            checked={Boolean(query.typesContrats?.includes('CDI'))}
            onChange={(value) => updateTypeContrat(value as TypeContrat)}
          />
          <Checkbox
            id='contrat--cdd'
            label='CDD - intérim - saisonnier'
            value='CDD-interim-saisonnier'
            checked={Boolean(
              query.typesContrats?.includes('CDD-interim-saisonnier')
            )}
            onChange={(value) => updateTypeContrat(value as TypeContrat)}
          />
          <Checkbox
            id='contrat--autres'
            label='Autres'
            value='autre'
            checked={Boolean(query.typesContrats?.includes('autre'))}
            onChange={(value) => updateTypeContrat(value as TypeContrat)}
          />
        </fieldset>

        <fieldset className='grow flex flex-col gap-y-8'>
          <legend className='contents text-base-bold'>Temps de travail</legend>

          <Checkbox
            id='temps-travail--plein'
            label='Temps plein'
            value='Temps plein'
            checked={Boolean(query.durees?.includes('Temps plein'))}
            onChange={(value) => updateDuree(value as Duree)}
          />
          <Checkbox
            id='temps-travail--partiel'
            label='Temps partiel'
            value='Temps partiel'
            checked={Boolean(query.durees?.includes('Temps partiel'))}
            onChange={(value) => updateDuree(value as Duree)}
          />
        </fieldset>
      </div>

      <fieldset>
        <legend className='text-base-bold mb-6'>Expérience</legend>
        <label htmlFor='debutants-acceptes' className='flex items-center'>
          <Switch
            id='debutants-acceptes'
            checked={Boolean(query.debutantAccepte)}
            onChange={updateExperience}
          />
          <span className='ml-8'>
            Afficher uniquement les offres débutant accepté
          </span>
        </label>
      </fieldset>

      {query.rayon !== undefined && (
        <fieldset className='mt-8 w-1/2 min-w-[300px]'>
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
