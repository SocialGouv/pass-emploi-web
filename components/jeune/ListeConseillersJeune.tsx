import { ConseillerHistorique } from 'interfaces/jeune'
import React from 'react'

interface ListeConseillersJeuneprops {
  id: string
  conseillers: ConseillerHistorique[]
}

//TODO: vérifier format date quand API prête
export function ListeConseillersJeune({
  id,
  conseillers,
}: ListeConseillersJeuneprops) {
  return (
    <ol className='list-disc' id={id}>
      {conseillers.map(({ nom, prenom, date, id: idConseiller }) => (
        <li className='ml-5' key={idConseiller}>
          Du {date} à aujourd’hui :{' '}
          <span className='text-base-medium'>
            {nom} {prenom}
          </span>
        </li>
      ))}
    </ol>
  )
}
