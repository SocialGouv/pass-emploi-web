import React from 'react'

import OffresList from 'components/favoris/offres/OffresList'
import { Offre } from 'interfaces/favoris'

interface OngletOffresProps {
  offres: Offre[]
}

export function OngletOffres({ offres }: OngletOffresProps) {
  return (
    <>
      <OffresList offres={offres} />
    </>
  )
}
