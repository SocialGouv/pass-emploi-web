import React from 'react'

import { TagMetier } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TR from 'components/ui/Table/TR'
import { Offre } from 'interfaces/favoris'

export default function OffreRow({ offre }: { offre: Offre }) {
  return (
    <TR>
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
      <TDLink
        href={`/offres/${offre.urlParam}/${offre.id}`}
        label={'Ouvrir l’offre ' + offre.titre}
      />
    </TR>
  )
}
