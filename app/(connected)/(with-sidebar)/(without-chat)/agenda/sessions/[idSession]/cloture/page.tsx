import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import ClotureSessionPage from 'app/(connected)/(with-sidebar)/(without-chat)/agenda/sessions/[idSession]/cloture/ClotureSessionPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { peutAccederAuxSessions } from 'interfaces/conseiller'
import { StatutAnimationCollective } from 'interfaces/evenement'
import { getConseillerServerSide } from 'services/conseillers.service'
import { getDetailsSession } from 'services/sessions.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

type ClotureSessionParams = {
  idSession: string
}
type ClotureSessionSearchParams = Partial<{ redirectUrl: string }>

export async function generateMetadata({
  params,
}: {
  params: ClotureSessionParams
}): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()

  const session = await getDetailsSession(
    user.id,
    params.idSession,
    accessToken
  )

  if (!session) notFound()

  return {
    title: `Clore - Session ${session.offre.titre}`,
  }
}

export default async function ClotureSession({
  params,
  searchParams,
}: {
  params: ClotureSessionParams
  searchParams?: ClotureSessionSearchParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()

  const conseiller = await getConseillerServerSide(user, accessToken)
  if (!peutAccederAuxSessions(conseiller)) redirect('/mes-jeunes')

  const session = await getDetailsSession(
    user.id,
    params.idSession,
    accessToken
  )
  if (!session) notFound()
  if (session?.session.statut !== StatutAnimationCollective.AClore) notFound()

  const inscriptionsInitiales = session.inscriptions.map((inscription) => {
    return { idJeune: inscription.idJeune, statut: inscription.statut }
  })

  const redirectParam = searchParams?.redirectUrl
    ? `?redirectUrl=${searchParams.redirectUrl}`
    : ''
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
