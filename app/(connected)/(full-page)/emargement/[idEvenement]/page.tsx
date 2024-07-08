import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import EmargementRdvPage from 'app/(connected)/(full-page)/emargement/[idEvenement]/EmargementRdvPage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import { Conseiller, estUserFranceTravail } from 'interfaces/conseiller'
import { Evenement } from 'interfaces/evenement'
import { Session } from 'interfaces/session'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getDetailsEvenement } from 'services/evenements.service'
import { getDetailsSession } from 'services/sessions.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
type EmargementRdvParams = { idEvenement: string }
type EmargementRdvSearchParams = { type: string }

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: EmargementRdvParams
  searchParams: EmargementRdvSearchParams
}): Promise<Metadata> {
  const evenementTypeSession = searchParams.type === 'session'
  if (!params?.idEvenement) notFound()

  const props = await buildProps(params.idEvenement, evenementTypeSession)

  const titre = evenementTypeSession
    ? (props.evenement as Session).session.nom
    : (props.evenement as Evenement).titre

  return {
    title: `Emargement - ${titre}`,
  }
}

export default async function EmargementRdv({
  params,
  searchParams,
}: {
  params?: EmargementRdvParams
  searchParams: EmargementRdvSearchParams
}) {
  const evenementTypeSession = searchParams.type === 'session'
  if (!params?.idEvenement) notFound()

  const props = await buildProps(params.idEvenement, evenementTypeSession)

  const titre = evenementTypeSession
    ? (props.evenement as Session).session.nom
    : (props.evenement as Evenement).titre

  return (
    <>
      <PageHeaderPortal header={`Emargement - ${titre}`} />

      <EmargementRdvPage
        evenement={props.evenement}
        agence={props.conseiller.structureMilo?.nom}
      />
    </>
  )
}

async function buildProps(
  idEvenement: string,
  evenementSession: boolean
): Promise<{
  evenement: Evenement | Session
  conseiller: Conseiller
}> {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (estUserFranceTravail(user)) redirect('/mes-jeunes')

  const conseiller = await getConseillerServerSide(user, accessToken)

  const evenement = evenementSession
    ? await getDetailsSession(user.id, idEvenement, accessToken)
    : await getDetailsEvenement(idEvenement, accessToken)
  if (!evenement) notFound()

  return { evenement, conseiller }
}
