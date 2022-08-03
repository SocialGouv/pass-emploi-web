import React from 'react'

import { ConseillerHistorique } from 'interfaces/jeune'
import { formatDayDate } from 'utils/date'

interface ListeConseillersJeuneprops {
  id: string
  conseillers: ConseillerHistorique[]
}

export function ListeConseillersJeune({
  id,
  conseillers,
}: ListeConseillersJeuneprops) {
  return (
    <ol className='list-disc' id={id}>
      {conseillers.map((conseiller, index, arr) => {
        const depuis = new Date(conseiller.depuis)

        if (index === 0) {
          return (
            <li className='list-none w-text-s-regular' key={depuis.getTime()}>
              Du {formatDayDate(depuis) + ' à aujourd’hui'}
              {' : '}
              <span className='text-s-bold'>
                {conseiller.nom} {conseiller.prenom}
              </span>
            </li>
          )
        }

        const conseillerSuivant = arr[index - 1]
        return (
          <li className='list-none w-text-s-regular' key={depuis.getTime()}>
            Du{' '}
            {formatDayDate(depuis) +
              ' au ' +
              formatDayDate(new Date(conseillerSuivant.depuis))}
            {' : '}
            <span className='text-s-bold'>
              {conseiller.nom} {conseiller.prenom}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
