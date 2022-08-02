import React from 'react'

import { Tag } from 'components/ui/Tag'
import { Recherche } from 'interfaces/favoris'

export default function RechercheRow(props: { recherche: Recherche }) {
  return (
    <div
      role='row'
      className='table-row h-20 min-h-full text-sm rounded-[6px] shadow-s hover:bg-primary_lighten group'
    >
      <div
        role='cell'
        className='table-cell p-3 align-middle text-base-medium group-hover:rounded-l-[6px]'
      >
        {props.recherche.titre}
      </div>
      <div role='cell' className='table-cell p-3 align-middle'>
        {props.recherche.metier}
      </div>
      <div role='cell' className='table-cell p-3 align-middle'>
        {props.recherche.localisation}
      </div>
      <div
        role='cell'
        className='table-cell p-3 align-middle group-hover:rounded-r-[6px]'
      >
        <Tag
          label={props.recherche.type}
          color='primary'
          backgroundColor='primary_lighten'
        />
      </div>
    </div>
  )
}
