import React, { useEffect } from 'react'

import Input from 'components/ui/Form/Input'
import { SearchImmersionsQuery } from 'services/immersions.service'
import { FormValues } from 'types/form'

type RechercheImmersionsSecondaryProps = {
  onCriteresChange: (nbCriteres: number) => void
  query: FormValues<SearchImmersionsQuery>
  onQueryUpdate: (query: FormValues<SearchImmersionsQuery>) => void
}

export default function RechercheImmersionsSecondary({
  onCriteresChange,
  query,
  onQueryUpdate,
}: RechercheImmersionsSecondaryProps) {
  const RAYON_MIN = 0
  const RAYON_MAX = 100

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
      <legend className='sr-only'>Étape 3 Plus de critères</legend>

      {query.rayon !== undefined && (
        <fieldset className='mt-8 w-full'>
          <legend className='text-base-bold mb-4'>Distance</legend>
          <label htmlFor='distance'>
            <span aria-hidden={true}>*&nbsp;</span>Dans un rayon de :{' '}
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
            required={true}
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
