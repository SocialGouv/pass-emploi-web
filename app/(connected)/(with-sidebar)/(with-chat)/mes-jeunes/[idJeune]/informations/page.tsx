import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import InformationsPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/informations/InformationsPage'
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

type InformationsParams = { idJeune: string }

export async function generateMetadata({
  params,
}: {
  params: InformationsParams
}): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const beneficiaire = await getJeuneDetails(params.idJeune, accessToken)
  if (!beneficiaire) notFound()

  const lectureSeule = user.id !== beneficiaire.idConseiller
  return {
    title: `Informations - ${getNomJeuneComplet(beneficiaire)} - ${lectureSeule ? 'Etablissement' : 'Portefeuille'}`,
  }
}

export default async function Informations({
  params,
}: {
  params: InformationsParams
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
      <PageHeaderPortal header={`${beneficiaire.prenom} ${beneficiaire.nom}`} />

      <InformationsPage
        conseillers={conseillers}
        idJeune={beneficiaire.id}
        situations={beneficiaire.situations}
        lectureSeule={lectureSeule}
        jeune={beneficiaire}
      />
    </>
  )
}
