import React from 'react'

import RechercheRow from 'components/favoris/recherches/RechercheRow'
import { Recherche } from 'interfaces/favoris'

interface TableauRecherchesProps {
  recherches: Recherche[]
}

export default function TableauRecherches({
  recherches,
}: TableauRecherchesProps) {
  const headCellStyle = 'text-base-regular text-left pb-3 px-3'

  return (
    <>
      {recherches.length === 0 && (
        <p className='text-base-regular mb-2'>
          Votre jeune n’a pas de recherche sauvegardée
        </p>
      )}

      {recherches.length > 0 && (
        <table className='w-full border-spacing-y-3 border-separate'>
          <caption className='sr-only'>
            Liste des recherches sauvegardées
          </caption>
          <thead>
            <tr>
              <th className={headCellStyle}>Nom de la recherche</th>
              <th className={headCellStyle}>Mot clé/métier</th>
              <th className={headCellStyle}>Lieu/localisation</th>
              <th className={headCellStyle}>Type</th>
            </tr>
          </thead>
          <tbody>
            {recherches.map((recherche) => (
              <RechercheRow key={recherche.id} recherche={recherche} />
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
