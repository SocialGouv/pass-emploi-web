import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import HistoriquePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/historique/HistoriquePage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { getNomJeuneComplet } from 'interfaces/jeune'
import {
  getConseillersDuJeuneServerSide,
  getJeuneDetails,
} from 'services/jeunes.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

type HistoriqueParams = { idJeune: string }

export async function generateMetadata({
  params,
}: {
  params: HistoriqueParams
}): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const beneficiaire = await getJeuneDetails(params.idJeune, accessToken)
  if (!beneficiaire) notFound()

  const lectureSeule = user.id !== beneficiaire.idConseiller
  return {
    title: `Historique - ${getNomJeuneComplet(beneficiaire)} - ${lectureSeule ? 'Etablissement' : 'Portefeuille'}`,
  }
}

export default async function Historique({
  params,
}: {
  params: HistoriqueParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const beneficiaire = await getJeuneDetails(params.idJeune, accessToken)
  if (!beneficiaire) notFound()

  const conseillers = await getConseillersDuJeuneServerSide(
    beneficiaire.id,
    accessToken
  )

  const lectureSeule = beneficiaire.idConseiller !== user.id
  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header='Historique' />

      <HistoriquePage
        conseillers={conseillers}
        idJeune={beneficiaire.id}
        situations={beneficiaire.situations}
        lectureSeule={lectureSeule}
      />
    </>
  )
}
