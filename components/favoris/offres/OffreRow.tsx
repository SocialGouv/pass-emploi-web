import React from 'react'

import { TagFavori, TagMetier } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TR from 'components/ui/Table/TR'
import { Offre } from 'interfaces/favoris'
import { toLongMonthDate, toShortDate } from 'utils/date'

export default function OffreRow({ offre }: { offre: Offre }) {
  return (
    <TR>
      <TD>
        <TagMetier
          label={offre.type}
          className='text-primary bg-primary_lighten'
        />
        {offre.id}
      </TD>
      <TD>{offre.titre}</TD>
      <TD>{offre.organisation}</TD>
      <TD>
        <TagFavori aPostule={offre.aPostule} />
        le&nbsp;
        <span aria-label={toLongMonthDate(offre.dateUpdate)}>
          {toShortDate(offre.dateUpdate)}
        </span>
      </TD>
      <TDLink
        href={`/offres/${offre.urlParam}/${offre.id}`}
        labelPrefix={'Ouvrir l’offre '}
      />
    </TR>
  )
}
