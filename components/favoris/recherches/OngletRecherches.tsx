import React from 'react'

import OffresList from '../offres/FavorisList'
import RecherchesList from './RecherchesList'

interface OngletRecherchesProps {
  recherches: []
}

export function OngletRecherches({ recherches }: OngletRecherchesProps) {
  return (
    <>
      <RecherchesList recherches={recherches} />
    </>
  )
}
