import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import IndicateursPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/indicateurs/IndicateursPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { estUserPoleEmploi } from 'interfaces/conseiller'
import { getNomJeuneComplet } from 'interfaces/jeune'
import { getJeuneDetails } from 'services/jeunes.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

interface IndicateursParams {
  idJeune: string
}

export async function generateMetadata({
  params,
}: {
  params: IndicateursParams
}): Promise<Metadata> {
  const { accessToken, user } = await getMandatorySessionServerSide()
  if (estUserPoleEmploi(user)) notFound()

  const beneficiaire = await getJeuneDetails(params.idJeune, accessToken)
  if (!beneficiaire) notFound()

  const lectureSeule = beneficiaire.idConseiller !== user.id
  return {
    title: `Indicateurs - ${getNomJeuneComplet(beneficiaire)} - ${lectureSeule ? 'Etablissement' : 'Portefeuille'}`,
  }
}

export default async function Indicateurs({
  params,
}: {
  params: IndicateursParams
}) {
  const { accessToken, user } = await getMandatorySessionServerSide()
  if (estUserPoleEmploi(user)) notFound()

  const beneficiaire = await getJeuneDetails(params.idJeune, accessToken)
  if (!beneficiaire) notFound()

  const lectureSeule = beneficiaire.idConseiller !== user.id
  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header='Indicateurs' />

      <IndicateursPage idJeune={beneficiaire.id} lectureSeule={lectureSeule} />
    </>
  )
}
