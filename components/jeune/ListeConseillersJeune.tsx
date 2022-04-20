import { ConseillerHistorique } from 'interfaces/jeune'
import React from 'react'
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
            <li className='ml-5' key={depuis.getTime()}>
              {formatDayDate(depuis) + ' à aujourd’hui'}{' '}
              <span className='text-base-medium'>
                {conseiller.nom} {conseiller.prenom}
              </span>
            </li>
          )
        }

        const conseillerSuivant = arr[index - 1]
        return (
          <li className='ml-5' key={depuis.getTime()}>
            {formatDayDate(depuis) +
              ' au ' +
              formatDayDate(new Date(conseillerSuivant.depuis))}{' '}
            <span className='text-base-medium'>
              {conseiller.nom} {conseiller.prenom}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
