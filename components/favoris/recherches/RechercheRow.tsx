import React from 'react'

import { TagMetier } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TR from 'components/ui/Table/TR'
import { Recherche } from 'interfaces/favoris'

export default function RechercheRow({ recherche }: { recherche: Recherche }) {
  return (
    <TR>
      <TD>{recherche.titre}</TD>
      <TD>{recherche.metier}</TD>
      <TD>{recherche.localisation}</TD>
      <TD>
        <TagMetier
          label={recherche.type}
          className='text-primary bg-primary_lighten'
        />
      </TD>
    </TR>
  )
}
