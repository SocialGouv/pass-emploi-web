import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import RendezVousPassesPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/rendez-vous-passes/RendezVousPassesPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { getNomBeneficiaireComplet } from 'interfaces/beneficiaire'
import { PeriodeEvenements } from 'interfaces/evenement'
import { estMilo } from 'interfaces/structure'
import { getJeuneDetails } from 'services/beneficiaires.service'
import { getRendezVousJeune } from 'services/evenements.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

type RendezVousPassesParams = Promise<{ idJeune: string }>

export async function generateMetadata({
  params,
}: {
  params: RendezVousPassesParams
}): Promise<Metadata> {
  const { accessToken } = await getMandatorySessionServerSide()
  const { idJeune } = await params
  const beneficiaire = await getJeuneDetails(idJeune, accessToken)
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
  const { idJeune } = await params

  const [beneficiaire, rdvs] = await Promise.all([
    getJeuneDetails(idJeune, accessToken),
    estMilo(user.structure)
      ? await getRendezVousJeune(idJeune, PeriodeEvenements.PASSES, accessToken)
      : [],
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

      <RendezVousPassesPage beneficiaire={beneficiaire} rdvs={rdvs} />
    </>
  )
}
