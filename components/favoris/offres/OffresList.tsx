import React, { Fragment } from 'react'

import { Offre } from '../../../interfaces/favoris'
import { HeaderCell } from '../../rdv/HeaderCell'

import OffreRow from 'components/favoris/offres/OffreRow'

interface FavorisListProps {
  offres: Offre[]
}

const OffresList = ({ offres }: FavorisListProps) => {
  return (
    <>
      {offres.length === 0 && (
        <p className='text-md mb-2'>
          Votre jeune n’a pas d’offre mise en favoris
        </p>
      )}

      {Boolean(offres.length) && (
        <div
          role='table'
          className='table w-full'
          aria-label='Liste des offres en favoris'
        >
          <div role='rowgroup' className='table-row-group'>
            <div role='row' className='table-row'>
              <HeaderCell label='N°Offre' />
              <HeaderCell label='Titre' />
              <HeaderCell label='Entreprise' />
              <HeaderCell label='Type' />
            </div>
          </div>
          <div role='rowgroup' className='table-row-group'>
            {offres.map((offre) => (
              <Fragment key={offre.id}>
                <OffreRow offre={offre} />
                <div className='mb-2' />
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default OffresList
