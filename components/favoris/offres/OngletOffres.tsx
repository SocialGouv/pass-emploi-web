import React from 'react'

import { Offre } from '../../../interfaces/favoris'

import OffresList from './OffresList'

interface OngletOffresProps {
  //TODO tableau de ... ?
  offres: Offre[]
}

export function OngletOffres({ offres }: OngletOffresProps) {
  return (
    <>
      <OffresList offres={offres} />
    </>
  )
}
