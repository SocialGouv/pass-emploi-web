import React, { useEffect } from 'react'

import Checkbox from 'components/offres/Checkbox'
import { DistanceRange } from 'components/offres/DistanceRange'
import { Switch } from 'components/ui/Form/Switch'
import {
  Duree,
  SearchOffresEmploiQuery,
  TypeContrat,
} from 'services/offres-emploi.service'
import { FormValues } from 'types/form'

type RechercheOffresEmploiSecondaireProps = {
  alternanceOnly: boolean
  onCriteresChange: (nbCriteres: number) => void
  query: FormValues<SearchOffresEmploiQuery>
  onQueryUpdate: (query: FormValues<SearchOffresEmploiQuery>) => void
}

export default function RechercheOffresEmploiSecondaire({
  alternanceOnly,
  onCriteresChange,
  query,
  onQueryUpdate,
}: RechercheOffresEmploiSecondaireProps) {
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
    if (query.typesContrats?.length) nbCriteres += query.typesContrats.length
    if (query.durees?.length) nbCriteres += query.durees.length
    if (query.debutantAccepte) nbCriteres++
    if (query.rayon !== undefined) nbCriteres++
    onCriteresChange(nbCriteres)
  }, [query])

  return (
    <fieldset>
      <legend className='sr-only'>Étape 3: Plus de critères</legend>

      <div className='flex mb-10'>
        {!alternanceOnly && (
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
        )}

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
        <div className='flex items-center'>
          <label htmlFor='debutants-acceptes' className='mr-4'>
            Afficher uniquement les offres débutant accepté
          </label>
          <Switch
            id='debutants-acceptes'
            checked={Boolean(query.debutantAccepte)}
            onChange={updateExperience}
          />
        </div>
      </fieldset>

      {query.rayon !== undefined && (
        <fieldset className='mt-8 w-1/2 min-w-[300px]'>
          <legend className='text-base-bold mb-4'>Distance</legend>
          <DistanceRange value={query.rayon} onChange={updateRayon} />
        </fieldset>
      )}
    </fieldset>
  )
}
