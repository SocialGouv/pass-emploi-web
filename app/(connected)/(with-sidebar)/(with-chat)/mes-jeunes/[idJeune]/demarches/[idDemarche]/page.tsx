import { DateTime } from 'luxon'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import DetailDemarchePage, {
  DetailDemarcheProps,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/demarches/[idDemarche]/DetailDemarchePage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import { estConseilDepartemental } from 'interfaces/structure'
import {
  getDemarchesBeneficiaire,
  getJeuneDetails,
} from 'services/beneficiaires.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

type DetailDemarcheParams = Promise<{ idJeune: string; idDemarche: string }>

export async function generateMetadata({
  params,
}: {
  params: DetailDemarcheParams
}): Promise<Metadata> {
  const { beneficiaire, demarche, lectureSeule } =
    await getDemarcheProps(params)

  return {
    title: `${demarche.titre} - Démarches de ${beneficiaire.prenom} ${beneficiaire.nom} - ${
      lectureSeule ? 'Etablissement' : 'Portefeuille'
    }`,
  }
}

export default async function DetailDemarche({
  params,
}: {
  params: DetailDemarcheParams
}) {
  const { beneficiaire, ...props } = await getDemarcheProps(params)

  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header='Détails de la démarche' />

      <DetailDemarchePage {...props} />
    </>
  )
}

async function getDemarcheProps(
  params: DetailDemarcheParams
): Promise<DetailDemarcheProps & { beneficiaire: BaseBeneficiaire }> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estConseilDepartemental(user.structure)) notFound()

  const trenteJoursAvant = DateTime.now().minus({ day: 30 }).startOf('day')
  const { idJeune, idDemarche } = await params

  const demarches = await getDemarchesBeneficiaire(
    idJeune,
    trenteJoursAvant,
    user.id,
    accessToken
  )
  const demarche = demarches?.data.find(({ id }) => id === idDemarche)
  if (!demarche) notFound()

  const beneficiaire = await getJeuneDetails(idJeune, accessToken)
  if (!beneficiaire) notFound()

  const lectureSeule = beneficiaire.idConseiller !== user.id
  const isStale = demarches!.isStale

  return { beneficiaire, demarche, lectureSeule, isStale }
}
