import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import PilotagePage, {
  Onglet,
} from 'app/(connected)/(with-sidebar)/(with-chat)/pilotage/PilotagePage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import {
  Conseiller,
  estUserPoleEmploi,
  peutAccederAuxSessions,
} from 'interfaces/conseiller'
import { AnimationCollectivePilotage } from 'interfaces/evenement'
import {
  getActionsAQualifierServerSide,
  getSituationsNonProfessionnelles,
} from 'services/actions.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getAnimationsCollectivesACloreServerSide } from 'services/evenements.service'
import {
  getSessionsACloreServerSide,
  SessionsAClore,
} from 'services/sessions.service'
import { MetadonneesPagination } from 'types/pagination'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
import { ApiError } from 'utils/httpClient'

export const metadata: Metadata = {
  title: 'Pilotage',
}

type PilotageSearchParams = Partial<{ onglet: string }>
export default async function Pilotage({
  searchParams,
}: {
  searchParams?: PilotageSearchParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (estUserPoleEmploi(user)) notFound()

  let conseiller: Conseiller | undefined
  try {
    conseiller = await getConseillerServerSide(user, accessToken)
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 401)
      redirect('/api/auth/federated-logout')

    throw e
  }
  if (!conseiller) notFound()

  const [actions, categoriesActions] = await Promise.all([
    getActionsAQualifierServerSide(user.id, accessToken),
    getSituationsNonProfessionnelles({ avecNonSNP: false }, accessToken),
  ])

  let evenements:
    | {
        animationsCollectives: AnimationCollectivePilotage[]
        metadonnees: MetadonneesPagination
      }
    | undefined
  let sessions: SessionsAClore[] | undefined

  if (conseiller.agence?.id) {
    evenements = await getAnimationsCollectivesACloreServerSide(
      conseiller.agence.id,
      accessToken
    )
  }

  if (peutAccederAuxSessions(conseiller)) {
    try {
      sessions = await getSessionsACloreServerSide(user.id, accessToken)
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 401)
        redirect('/api/auth/federated-logout')

      sessions = []
    }
  }

  let onglet: Onglet = 'ACTIONS'
  switch (searchParams?.onglet) {
    case 'animationsCollectives':
      onglet = 'ANIMATIONS_COLLECTIVES'
      break
    case 'sessionsImilo':
      onglet = 'SESSIONS_IMILO'
      break
  }

  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header='Pilotage' />

      <PilotagePage
        actions={{ donnees: actions.actions, metadonnees: actions.metadonnees }}
        categoriesActions={categoriesActions}
        animationsCollectives={
          evenements && {
            donnees: evenements.animationsCollectives,
            metadonnees: evenements.metadonnees,
          }
        }
        sessions={sessions}
        onglet={onglet}
      />
    </>
  )
}