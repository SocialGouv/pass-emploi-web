import React from 'react'

import TableauOffres from 'components/favoris/offres/TableauOffres'
import { Offre } from 'interfaces/favoris'

interface OngletOffresProps {
  offres: Offre[]
}

export function OngletOffres({ offres }: OngletOffresProps) {
  return (
    <>
      <TableauOffres offres={offres} />
    </>
  )
}
