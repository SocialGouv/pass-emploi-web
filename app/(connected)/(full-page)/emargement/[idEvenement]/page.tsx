import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import EmargementRdvPage, {
  EmargementRdvPageProps,
} from 'app/(connected)/(full-page)/emargement/[idEvenement]/EmargementRdvPage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import { estUserMilo } from 'interfaces/conseiller'
import { Evenement } from 'interfaces/evenement'
import { Session } from 'interfaces/session'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getDetailsEvenement } from 'services/evenements.service'
import { getDetailsSession } from 'services/sessions.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

type EmargementRdvParams = Promise<{ idEvenement: string }>
type EmargementRdvSearchParams = Promise<{ type: string }>
type RouteProps = {
  params: EmargementRdvParams
  searchParams?: EmargementRdvSearchParams
}

export async function generateMetadata(
  routeProps: RouteProps
): Promise<Metadata> {
  const { titre } = await buildProps(routeProps)

  return { title: titre }
}

export default async function EmargementRdv(routeProps: RouteProps) {
  const { titre, ...props } = await buildProps(routeProps)

  return (
    <>
      <PageHeaderPortal header={titre} />

      <EmargementRdvPage {...props} />
    </>
  )
}

async function buildProps({
  params,
  searchParams,
}: {
  params: EmargementRdvParams
  searchParams?: EmargementRdvSearchParams
}): Promise<{ titre: string } & EmargementRdvPageProps> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estUserMilo(user)) redirect('/mes-jeunes')

  const { idEvenement } = await params
  const { type } = (await searchParams) ?? {}
  const isSession = type === 'session'

  const conseiller = await getConseillerServerSide(user, accessToken)

  const evenement = isSession
    ? await getDetailsSession(user.id, idEvenement, accessToken)
    : await getDetailsEvenement(idEvenement, accessToken)
  if (!evenement) notFound()
  const titreEvenement = isSession
    ? (evenement as Session).session.nom
    : (evenement as Evenement).titre

  return {
    titre: 'Emargement - ' + titreEvenement,
    evenement,
    agence: conseiller.structureMilo?.nom,
  }
}
