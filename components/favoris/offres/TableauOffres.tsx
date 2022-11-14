import React from 'react'

import OffreRow from 'components/favoris/offres/OffreRow'
import { HeaderCell } from 'components/ui/Table/HeaderCell'
import TableLayout from 'components/ui/Table/TableLayout'
import { Offre } from 'interfaces/favoris'

interface TableauOffresProps {
  offres: Offre[]
}

export default function TableauOffres({ offres }: TableauOffresProps) {
  return (
    <>
      {offres.length === 0 && (
        <p className='text-base-regular mb-2'>
          Votre jeune n’a pas d’offre mise en favoris
        </p>
      )}

      {offres.length > 0 && (
        <TableLayout caption='Liste des offres en favoris'>
          <div role='rowgroup' className='table-header-group'>
            <div role='row' className='table-row'>
              <HeaderCell>N°Offre</HeaderCell>
              <HeaderCell>Titre</HeaderCell>
              <HeaderCell>Entreprise</HeaderCell>
              <HeaderCell>Type</HeaderCell>
            </div>
          </div>
          <div role='rowgroup' className='table-row-group'>
            {offres.map((offre) => (
              <OffreRow key={offre.id} offre={offre} />
            ))}
          </div>
        </TableLayout>
      )}
    </>
  )
}
