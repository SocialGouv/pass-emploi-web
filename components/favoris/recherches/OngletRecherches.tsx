import React from 'react'

import RecherchesList from 'components/favoris/recherches/RecherchesList'
import { Recherche } from 'interfaces/favoris'

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
