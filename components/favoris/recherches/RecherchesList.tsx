import React, { Fragment } from 'react'

import RechercheRow from 'components/favoris/recherches/RechercheRow'
import { HeaderCell } from 'components/rdv/HeaderCell'
import { Recherche } from 'interfaces/favoris'

interface RecherchesListProps {
  recherches: Recherche[]
}

const RecherchesList = ({ recherches }: RecherchesListProps) => {
  return (
    <>
      {recherches.length === 0 && (
        <p className='text-md mb-2'>
          Votre jeune n’a pas de recherche sauvegardée
        </p>
      )}

      {Boolean(recherches.length) && (
        <div
          role='table'
          className='table w-full'
          aria-label='Liste des recherches sauvegardées'
        >
          <div role='rowgroup' className='table-row-group'>
            <div role='row' className='table-row'>
              <HeaderCell label='Nom de la recherche' />
              <HeaderCell label='Mot clé/ métier' />
              <HeaderCell label='Lieu/ localisation' />
              <HeaderCell label='Type' />
            </div>
          </div>
          <div role='rowgroup' className='table-row-group'>
            {recherches.map((recherche) => (
              <Fragment key={recherche.id}>
                <RechercheRow recherche={recherche} />
                <div className='mb-2' />
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default RecherchesList
