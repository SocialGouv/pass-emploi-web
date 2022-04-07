import { HistoriqueConseiller } from 'interfaces/jeune'
import React from 'react'

interface ListeConseillersJeuneprops {
  id: string
  conseillers: HistoriqueConseiller[]
}

//TODO: vérifier format date quand API prête
export function ListeConseillersJeune({
  id,
  conseillers,
}: ListeConseillersJeuneprops) {
  return (
    <ol className='list-disc' id={id}>
      {conseillers.map(({ nom, prenom, date, id }) => (
        <li className='ml-5' key={id}>
          Du {date} à aujourd&apos;hui :{' '}
          <span className='text-base-medium'>
            {nom} {prenom}
          </span>
        </li>
      ))}
    </ol>
  )
}
