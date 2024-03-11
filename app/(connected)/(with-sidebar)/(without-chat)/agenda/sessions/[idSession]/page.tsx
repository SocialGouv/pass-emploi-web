import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import FicheDetailsSession from 'app/(connected)/(with-sidebar)/(without-chat)/agenda/sessions/[idSession]/DetailsSessionPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { estUserMilo, peutAccederAuxSessions } from 'interfaces/conseiller'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getBeneficiairesDeLaStructureMilo } from 'services/jeunes.service'
import { getDetailsSession } from 'services/sessions.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
import redirectedFromHome from 'utils/redirectedFromHome'

type DetailsSessionParams = {
  idSession: string
}
type DetailsSessionSearchParams = Partial<{ redirectUrl: string }>

export async function generateMetadata({
  params,
}: {
  params: DetailsSessionParams
}): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()

  const session = await getDetailsSession(
    user.id,
    params.idSession,
    accessToken
  )

  return {
    title: `Détail session ${session?.session.nom} - Agenda`,
  }
}

export default async function DetailsSession({
  params,
  searchParams,
}: {
  params: DetailsSessionParams
  searchParams?: DetailsSessionSearchParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()

  if (!estUserMilo(user)) notFound()

  const idSession = params.idSession

  let redirectTo = searchParams?.redirectUrl
  if (!redirectTo) {
    const referer = headers().get('referer')
    redirectTo =
      referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes'
  }

  const session = await getDetailsSession(user.id, idSession, accessToken)
  if (!session) notFound()

  const conseiller = await getConseillerServerSide(user, accessToken)
  if (!peutAccederAuxSessions(conseiller)) redirect('/mes-jeunes')

  const beneficiairesStructureMilo = await getBeneficiairesDeLaStructureMilo(
    conseiller.structureMilo!.id,
    accessToken
  )

  return (
    <>
      <PageRetourPortal lien={redirectTo} />
      <PageHeaderPortal header='Clôture de la session' />

      <FicheDetailsSession
        session={session}
        returnTo={redirectTo}
        beneficiairesStructureMilo={beneficiairesStructureMilo.jeunes}
      />
    </>
  )
}
