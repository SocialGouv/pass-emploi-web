import React from 'react'

import OffreRow from 'components/favoris/offres/OffreRow'
import { Offre } from 'interfaces/favoris'

interface TableauOffresProps {
  offres: Offre[]
  handleRedirectionOffre: (offre: Offre) => void
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
        <table className='w-full border-separate border-spacing-y-2'>
          <caption className='sr-only'>Liste des offres en favoris</caption>
          <thead>
            <tr>
              <th className='text-base-regular text-left p-4'>N°Offre</th>
              <th className='text-base-regular text-left p-4'>Titre</th>
              <th className='text-base-regular text-left p-4'>Entreprise</th>
              <th className='text-base-regular text-left p-4'>Type</th>
              <th className='aria-hidden' />
            </tr>
          </thead>
          <tbody>
            {offres.map((offre) => (
              <OffreRow
                key={offre.id}
                offre={offre}
                handleRedirectionOffre={handleRedirectionOffre}
              />
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
