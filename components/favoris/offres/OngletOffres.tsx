import React from 'react'

import TableauOffres from 'components/favoris/offres/TableauOffres'
import { Offre } from 'interfaces/favoris'

interface OngletOffresProps {
  offres: Offre[]
  handleRedirectionOffre: (idOffre: string, type: string) => void
}

export function OngletOffres({
  offres,
  handleRedirectionOffre,
}: OngletOffresProps) {
  return (
    <TableauOffres
      offres={offres}
      handleRedirectionOffre={handleRedirectionOffre}
    />
  )
}
