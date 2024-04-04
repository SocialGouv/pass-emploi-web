import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import EmargementRdvPage from 'app/(connected)/(full-page)/emargement/[idEvenement]/EmargementRdvPage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import { estUserPoleEmploi } from 'interfaces/conseiller'
import { Evenement } from 'interfaces/evenement'
import { getDetailsEvenement } from 'services/evenements.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
type EmargementRdvParams = { idEvenement: string }

export async function generateMetadata({
  params,
}: {
  params: EmargementRdvParams
}): Promise<Metadata> {
  const evenement = await buildProps(params.idEvenement)

  if (!evenement) redirect('/mes-jeunes')

  return {
    title: `Emargement - ${evenement.titre}`,
  }
}

export default async function EmargementRdv({
  params,
}: {
  params?: EmargementRdvParams
}) {
  const evenement = await buildProps(params.idEvenement)

  return (
    <>
      <PageHeaderPortal header={`Emargement - ${evenement.titre}`} />

      <EmargementRdvPage evenement={evenement} />
    </>
  )
}

async function buildProps(idEvenement: string): Promise<Evenement> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (estUserPoleEmploi(user)) redirect('/mes-jeunes')

  const evenement = await getDetailsEvenement(idEvenement, accessToken)
  if (!evenement) notFound()

  return evenement
}
