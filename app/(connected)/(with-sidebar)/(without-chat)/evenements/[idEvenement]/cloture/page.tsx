import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import CloturePage from 'app/(connected)/(with-sidebar)/(without-chat)/evenements/[idEvenement]/cloture/CloturePage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { StatutAnimationCollective } from 'interfaces/evenement'
import { estMilo } from 'interfaces/structure'
import { getDetailsEvenement } from 'services/evenements.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = {
  title: 'Clore - Mes événements',
}

type ClotureParams = Promise<{ idEvenement: string }>
type ClotureSearchParams = Promise<Partial<{ redirectUrl: string }>>
export default async function Cloture({
  params,
  searchParams,
}: {
  params: ClotureParams
  searchParams?: ClotureSearchParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estMilo(user.structure)) redirect('/mes-jeunes')

  const { idEvenement } = await params
  const evenement = await getDetailsEvenement(idEvenement, accessToken)
  if (evenement?.statut !== StatutAnimationCollective.AClore) notFound()

  const { redirectUrl } = (await searchParams) ?? {}
  const redirectParam = redirectUrl ? `&redirectUrl=${redirectUrl}` : ''
  const returnTo = `/mes-jeunes/edition-rdv?idRdv=${evenement.id}${redirectParam}`

  return (
    <>
      <PageRetourPortal lien={returnTo} />
      <PageHeaderPortal header='Clôture de l’événement' />

      <CloturePage evenement={evenement} returnTo={returnTo} />
    </>
  )
}
