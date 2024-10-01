'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React from 'react'

import { TabFavoris } from 'components/jeune/TabFavoris'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import { Offre, Recherche } from 'interfaces/favoris'

type FavorisProps = {
  beneficiaire: BaseBeneficiaire
  lectureSeule: boolean
  offres: Offre[]
  recherches: Recherche[]
}

function FavorisPage({
  beneficiaire,
  offres,
  recherches,
  lectureSeule,
}: FavorisProps) {
  return (
    <TabFavoris
      demarches={[]}
      beneficiaire={beneficiaire}
      offres={offres}
      recherches={recherches}
      lectureSeule={lectureSeule}
    />
  )
}

export default withTransaction(FavorisPage.name, 'page')(FavorisPage)
