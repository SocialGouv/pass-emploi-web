import React from 'react'

import OffreRow from 'components/favoris/offres/OffreRow'
import { HeaderCell } from 'components/rdv/HeaderCell'
import { Offre } from 'interfaces/favoris'

interface TableauOffresProps {
  offres: Offre[]
  handleRedirectionOffre: (idOffre: string, type: string) => void
}

export default function TableauOffres({
  offres,
  handleRedirectionOffre,
}: TableauOffresProps) {
  return (
    <>
      {offres.length === 0 && (
        <p className='text-base-regular mb-2'>
          Votre jeune n’a pas d’offre mise en favoris
        </p>
      )}

      {offres.length > 0 && (
        <div
          role='table'
          className='table w-full border-spacing-y-2'
          aria-label='Liste des offres en favoris'
        >
          <div role='rowgroup' className='table-row-group'>
            <div role='row' className='table-row'>
              <HeaderCell label='N°Offre' />
              <HeaderCell label='Titre' />
              <HeaderCell label='Entreprise' />
              <HeaderCell label='Type' />
              <HeaderCell label='Type' />
            </div>
          </div>
          <div role='rowgroup' className='table-row-group'>
            {offres.map((offre) => (
              <OffreRow
                key={offre.id}
                offre={offre}
                handleRedirectionOffre={handleRedirectionOffre}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
