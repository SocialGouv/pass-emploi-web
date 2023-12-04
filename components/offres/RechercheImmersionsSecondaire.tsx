import React, { useEffect } from 'react'

import { DistanceRange } from 'components/offres/DistanceRange'
import { SearchImmersionsQuery } from 'services/immersions.service'
import { FormValues } from 'types/form'

type RechercheImmersionsSecondaireProps = {
  onCriteresChange: (nbCriteres: number) => void
  query: FormValues<SearchImmersionsQuery>
  onQueryUpdate: (query: FormValues<SearchImmersionsQuery>) => void
}

export default function RechercheImmersionsSecondaire({
  onCriteresChange,
  query,
  onQueryUpdate,
}: RechercheImmersionsSecondaireProps) {
  function updateRayon(rayon: number) {
    onQueryUpdate({ ...query, rayon })
  }

  useEffect(() => {
    let nbCriteres = 0
    if (query.rayon) nbCriteres++
    onCriteresChange(nbCriteres)
  }, [onCriteresChange, query])

  return (
    <fieldset className='w-1/2 min-w-[300px]'>
      <legend className='sr-only'>Étape 3: Plus de critères</legend>

      {query.rayon !== undefined && (
        <fieldset className='mt-8 w-full'>
          <legend className='text-base-bold mb-4'>Distance</legend>
          <DistanceRange
            value={query.rayon}
            onChange={updateRayon}
            required={true}
          />
        </fieldset>
      )}
    </fieldset>
  )
}
