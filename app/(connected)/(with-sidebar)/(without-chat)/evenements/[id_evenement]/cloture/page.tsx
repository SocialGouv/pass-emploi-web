import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import CloturePage from 'app/(connected)/(with-sidebar)/(without-chat)/evenements/[id_evenement]/cloture/CloturePage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { estUserMilo } from 'interfaces/conseiller'
import { StatutAnimationCollective } from 'interfaces/evenement'
import { getDetailsEvenement } from 'services/evenements.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = {
  title: 'Clore - Mes événements',
}

type ClotureParams = { id_evenement: string }
type ClotureSearchParams = Partial<{ redirectUrl: string }>
export default async function Cloture({
  params,
  searchParams,
}: {
  params: ClotureParams
  searchParams?: ClotureSearchParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estUserMilo(user)) redirect('/mes-jeunes')

  const evenement = await getDetailsEvenement(params.id_evenement, accessToken)
  if (evenement?.statut !== StatutAnimationCollective.AClore) notFound()

  const redirectParam = searchParams?.redirectUrl
    ? `&redirectUrl=${searchParams.redirectUrl}`
    : ''
  const returnTo = `/mes-jeunes/edition-rdv?idRdv=${evenement.id}${redirectParam}`

  return (
    <>
      <PageRetourPortal lien={returnTo} />
      <PageHeaderPortal header='Clôture de l’événement' />

      <CloturePage evenement={evenement} returnTo={returnTo} />
    </>
  )
}
