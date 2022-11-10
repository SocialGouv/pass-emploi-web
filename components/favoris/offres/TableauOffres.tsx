import React from 'react'

import OffreRow from 'components/favoris/offres/OffreRow'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
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
        <Table asDiv={true} caption='Liste des offres en favoris'>
          <THead>
            <TH>N°Offre</TH>
            <TH>Titre</TH>
            <TH>Entreprise</TH>
            <TH>Type</TH>
          </THead>
          <TBody>
            {offres.map((offre) => (
              <OffreRow key={offre.id} offre={offre} />
            ))}
          </TBody>
        </Table>
      )}
    </>
  )
}
