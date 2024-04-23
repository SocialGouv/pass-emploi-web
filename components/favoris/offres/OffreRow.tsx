import React from 'react'

import { TagMetier } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TR from 'components/ui/Table/TR'
import { Offre } from 'interfaces/favoris'

export default function OffreRow({ offre }: { offre: Offre }) {
  const titre = 'Ouvrir l’offre ' + offre.titre

  return (
    <TR
      href={`/offres/${offre.urlParam}/${offre.id}`}
      linkLabel={titre}
      rowLabel={`Offre ${offre.titre}`}
    >
      <TD>{offre.id}</TD>
      <TD>{offre.titre}</TD>
      <TD>{offre.organisation}</TD>
      <TD>
        <TagMetier
          label={offre.type}
          color='primary'
          backgroundColor='primary_lighten'
        />
      </TD>
    </TR>
  )
}
