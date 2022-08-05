import React from 'react'

import { Tag } from 'components/ui/Tag'
import { Recherche } from 'interfaces/favoris'
import { jsonToTypeRecherche, TypeRechercheJson } from 'interfaces/json/favoris'

export default function RechercheRow({ recherche }: { recherche: Recherche }) {
  return (
    <tr className='text-base-regular rounded-small shadow-s hover:bg-primary_lighten'>
      <td className='p-3 align-middle text-base-medium rounded-l-small'>
        {recherche.titre}
      </td>
      <td className='p-3 align-middle'>{recherche.metier}</td>
      <td className='p-3 align-middle'>{recherche.localisation}</td>
      <td className='p-3 align-middle rounded-r-small'>
        <Tag
          label={jsonToTypeRecherche(recherche.type as TypeRechercheJson)}
          color='primary'
          backgroundColor='primary_lighten'
        />
      </td>
    </tr>
  )
}
