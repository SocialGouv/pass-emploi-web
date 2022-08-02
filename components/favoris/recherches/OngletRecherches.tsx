import React from 'react'

import { Recherche } from '../../../interfaces/favoris'

import RecherchesList from './RecherchesList'

interface OngletRecherchesProps {
  recherches: Recherche[]
}

export function OngletRecherches({ recherches }: OngletRecherchesProps) {
  return (
    <>
      <RecherchesList recherches={recherches} />
    </>
  )
}
