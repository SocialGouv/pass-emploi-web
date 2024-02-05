'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React from 'react'

import { TabFavoris } from 'components/jeune/TabFavoris'
import { Offre, Recherche } from 'interfaces/favoris'

type FavorisProps = {
  lectureSeule: boolean
  offres: Offre[]
  recherches: Recherche[]
}

function FavorisPage({ offres, recherches, lectureSeule }: FavorisProps) {
  return (
    <TabFavoris
      offres={offres}
      recherches={recherches}
      lectureSeule={lectureSeule}
    />
  )
}

export default withTransaction(FavorisPage.name, 'page')(FavorisPage)
