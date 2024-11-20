import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import PilotagePage, {
  Onglet,
} from 'app/(connected)/(with-sidebar)/(with-chat)/pilotage/PilotagePage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { estUserMilo, peutAccederAuxSessions } from 'interfaces/conseiller'
import { AnimationCollectivePilotage } from 'interfaces/evenement'
import { getActionsAQualifierServerSide } from 'services/actions.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getAnimationsCollectivesACloreServerSide } from 'services/evenements.service'
import { getSituationsNonProfessionnelles } from 'services/referentiel.service'
import {
  getSessionsACloreServerSide,
  SessionsAClore,
} from 'services/sessions.service'
import { MetadonneesPagination } from 'types/pagination'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

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
  if (!estUserMilo(user)) notFound()

  const [conseiller, actions, categoriesActions] = await Promise.all([
    getConseillerServerSide(user, accessToken),
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
    } catch (_e) {
      sessions = undefined
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
