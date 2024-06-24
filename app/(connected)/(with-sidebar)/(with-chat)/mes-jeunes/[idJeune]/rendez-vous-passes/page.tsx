import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import RendezVousPassesPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/rendez-vous-passes/RendezVousPassesPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { estUserPoleEmploi } from 'interfaces/conseiller'
import { PeriodeEvenements } from 'interfaces/evenement'
import { getNomBeneficiaireComplet } from 'interfaces/beneficiaire'
import { getRendezVousJeune } from 'services/evenements.service'
import { getJeuneDetails } from 'services/jeunes.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

type RendezVousPassesParams = { idJeune: string }

export async function generateMetadata({
  params,
}: {
  params: RendezVousPassesParams
}): Promise<Metadata> {
  const { accessToken } = await getMandatorySessionServerSide()
  const beneficiaire = await getJeuneDetails(params.idJeune, accessToken)
  if (!beneficiaire) notFound()

  return {
    title: 'Rendez-vous passés - ' + getNomBeneficiaireComplet(beneficiaire),
  }
}

export default async function RendezVousPasses({
  params,
}: {
  params: RendezVousPassesParams
}) {
  const { accessToken, user } = await getMandatorySessionServerSide()
  const isPoleEmploi = estUserPoleEmploi(user)

  const [beneficiaire, rdvs] = await Promise.all([
    getJeuneDetails(params.idJeune, accessToken),
    isPoleEmploi
      ? []
      : await getRendezVousJeune(
          params.idJeune,
          PeriodeEvenements.PASSES,
          accessToken
        ),
  ])
  if (!beneficiaire) notFound()

  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal
        header={
          'Rendez-vous passés de ' + getNomBeneficiaireComplet(beneficiaire)
        }
      />

      <RendezVousPassesPage
        beneficiaire={beneficiaire}
        rdvs={rdvs}
        lectureSeule={beneficiaire.idConseiller !== user.id}
      />
    </>
  )
}
