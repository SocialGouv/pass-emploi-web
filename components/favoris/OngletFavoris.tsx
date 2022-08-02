import React from 'react'

import FavorisList from './FavorisList'

interface OngletFavorisProps {
  //TODO tableau de ... ?
  offres: []
}

export function OngletFavoris({ offres }: OngletFavorisProps) {
  return (
    <>
      <FavorisList offres={offres} />
    </>
  )
}
