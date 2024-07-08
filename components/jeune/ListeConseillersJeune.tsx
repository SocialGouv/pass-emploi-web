import { DateTime } from 'luxon'
import React, { useCallback } from 'react'

import { ConseillerHistorique } from 'interfaces/beneficiaire'
import { toShortDate as _toShortDate } from 'utils/date'

interface ListeConseillersJeuneprops {
  id: string
  conseillers: ConseillerHistorique[]
}

export function ListeConseillersJeune({
  id,
  conseillers,
}: ListeConseillersJeuneprops) {
  const getDepuis = useCallback(
    (conseiller: ConseillerHistorique) => DateTime.fromISO(conseiller.depuis),
    []
  )
  const toShortDate = useCallback(
    (depuis: DateTime) => _toShortDate(depuis),
    []
  )

  return (
    <ol className='list-disc' id={id}>
      {conseillers.map((conseiller, index, arr) => {
        const depuis = getDepuis(conseiller)

        if (index === 0) {
          return (
            <li className='list-none text-base-regular' key={depuis.toMillis()}>
              Du {toShortDate(depuis) + ' à aujourd’hui'}
              {' : '}
              <span className='text-base-bold'>
                {conseiller.nom} {conseiller.prenom}
              </span>
            </li>
          )
        }

        const conseillerSuivant = arr[index - 1]
        return (
          <li className='list-none text-base-regular' key={depuis.toMillis()}>
            Du{' '}
            {toShortDate(depuis) +
              ' au ' +
              toShortDate(getDepuis(conseillerSuivant))}
            {' : '}
            <span className='text-base-bold'>
              {conseiller.nom} {conseiller.prenom}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
