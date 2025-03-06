import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import FicheDetailsSession from 'app/(connected)/(with-sidebar)/(without-chat)/agenda/sessions/[idSession]/DetailsSessionPage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { peutAccederAuxSessions } from 'interfaces/conseiller'
import { estMilo } from 'interfaces/structure'
import { getBeneficiairesDeLaStructureMilo } from 'services/beneficiaires.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getDetailsSession } from 'services/sessions.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'
import { redirectedFromHome } from 'utils/helpers'

type DetailsSessionParams = Promise<{ idSession: string }>
type DetailsSessionSearchParams = Promise<Partial<{ redirectUrl: string }>>
type RouteProps = {
  params: DetailsSessionParams
  searchParams?: DetailsSessionSearchParams
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  const { idSession } = await params

  const session = await getDetailsSession(user.id, idSession, accessToken)

  return {
    title: `Détail session ${session?.session.nom} - Agenda`,
  }
}
export default async function DetailsSession({
  params,
  searchParams,
}: RouteProps) {
  const { user, accessToken } = await getMandatorySessionServerSide()

  if (!estMilo(user.structure)) notFound()

  const { idSession } = await params
  const { redirectUrl } = (await searchParams) ?? {}

  let redirectTo = redirectUrl
  if (!redirectTo) {
    const referer = (await headers()).get('referer')
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
        beneficiairesStructureMilo={beneficiairesStructureMilo.beneficiaires}
      />
    </>
  )
}
