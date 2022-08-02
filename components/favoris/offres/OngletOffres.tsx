import React from 'react'

import OffresList from './FavorisList'

interface OngletOffresProps {
  //TODO tableau de ... ?
  offres: []
}

export function OngletOffres({ offres }: OngletOffresProps) {
  return (
    <>
      <OffresList offres={offres} />
    </>
  )
}
