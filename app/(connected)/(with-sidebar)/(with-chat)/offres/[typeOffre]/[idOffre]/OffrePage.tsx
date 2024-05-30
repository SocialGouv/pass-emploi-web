'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React, { useState } from 'react'

import ImmersionDetail from 'components/offres/ImmersionDetail'
import OffreEmploiDetail from 'components/offres/OffreEmploiDetail'
import ServiceCiviqueDetail from 'components/offres/ServiceCiviqueDetail'
import { DetailOffre, TypeOffre } from 'interfaces/offre'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

type DetailOffreProps = {
  offre: DetailOffre
}

function OffrePage({ offre }: DetailOffreProps) {
  const [portefeuille] = usePortefeuille()
  const [labelMatomo, setLabelMatomo] = useState<string>('Détail offre')

  function getDetailOffre() {
    switch (offre.type) {
      case TypeOffre.EMPLOI:
      case TypeOffre.ALTERNANCE:
        return (
          <OffreEmploiDetail offre={offre} onLienExterne={setLabelMatomo} />
        )
      case TypeOffre.SERVICE_CIVIQUE:
        return (
          <ServiceCiviqueDetail offre={offre} onLienExterne={setLabelMatomo} />
        )
      case TypeOffre.IMMERSION:
        return <ImmersionDetail offre={offre} />
    }
  }

  useMatomo(labelMatomo, portefeuille.length > 0)

  return getDetailOffre()
}

export default withTransaction(OffrePage.name, 'page')(OffrePage)
