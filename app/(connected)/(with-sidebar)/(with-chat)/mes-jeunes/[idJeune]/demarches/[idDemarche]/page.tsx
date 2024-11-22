import { DateTime } from 'luxon'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import DetailDemarchePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/demarches/[idDemarche]/DetailDemarchePage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { estUserCD } from 'interfaces/conseiller'
import { getDemarchesBeneficiaire } from 'services/actions.service'
import { getJeuneDetails } from 'services/beneficiaires.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

type DetailDemarcheParams = { idJeune: string; idDemarche: string }

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
  const { demarche, lectureSeule, isStale } = await getDemarcheProps(params)

  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header='Détails de la démarche' />

      <DetailDemarchePage
        demarche={demarche}
        lectureSeule={lectureSeule}
        isStale={isStale}
      />
    </>
  )
}

async function getDemarcheProps({ idJeune, idDemarche }: DetailDemarcheParams) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estUserCD(user)) notFound()

  const trenteJoursAvant = DateTime.now().minus({ day: 30 }).startOf('day')

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
