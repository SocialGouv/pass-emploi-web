import React from 'react'

import TableauRecherches from 'components/favoris/recherches/TableauRecherches'
import { Recherche } from 'interfaces/favoris'

interface OngletRecherchesProps {
  recherches: Recherche[]
}

export function OngletRecherches({ recherches }: OngletRecherchesProps) {
  return (
    <>
      <TableauRecherches recherches={recherches} />
    </>
  )
}
