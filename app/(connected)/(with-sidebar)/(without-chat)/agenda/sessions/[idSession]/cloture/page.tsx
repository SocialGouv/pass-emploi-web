import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import ClotureSessionPage from 'app/(connected)/(with-sidebar)/(without-chat)/agenda/sessions/[idSession]/cloture/ClotureSessionPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { peutAccederAuxSessions } from 'interfaces/conseiller'
import { StatutAnimationCollective } from 'interfaces/evenement'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getDetailsSession } from 'services/sessions.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

type ClotureSessionParams = Promise<{ idSession: string }>
type ClotureSessionSearchParams = Promise<Partial<{ redirectUrl: string }>>
type RouteProps = {
  params: ClotureSessionParams
  searchParams?: ClotureSessionSearchParams
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const { idSession } = await params

  const session = await getDetailsSession(user.id, idSession, accessToken)

  if (!session) notFound()

  return {
    title: `Clore - Session ${session.offre.titre}`,
  }
}
export default async function ClotureSession({
  params,
  searchParams,
}: RouteProps) {
  const { user, accessToken } = await getMandatorySessionServerSide()

  const conseiller = await getConseillerServerSide(user, accessToken)
  if (!peutAccederAuxSessions(conseiller)) redirect('/mes-jeunes')

  const { idSession } = await params
  const session = await getDetailsSession(user.id, idSession, accessToken)
  if (!session) notFound()
  if (session?.session.statut !== StatutAnimationCollective.AClore) notFound()

  const inscriptionsInitiales = session.inscriptions.map((inscription) => {
    return { idJeune: inscription.idJeune, statut: inscription.statut }
  })

  const { redirectUrl } = (await searchParams) ?? {}
  const redirectParam = redirectUrl ? `?redirectUrl=${redirectUrl}` : ''
  const returnTo = `/agenda/sessions/${session.session.id}${redirectParam}`

  return (
    <>
      <PageRetourPortal lien={returnTo} />
      <PageHeaderPortal header='Clôture de la session' />

      <ClotureSessionPage
        session={session}
        returnTo={returnTo}
        inscriptionsInitiales={inscriptionsInitiales}
      />
    </>
  )
}
