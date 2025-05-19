import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import PilotagePage, {
  Onglet,
} from 'app/(connected)/(with-sidebar)/(with-chat)/pilotage/PilotagePage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { peutAccederAuxSessions } from 'interfaces/conseiller'
import {
  isCodeTypeAnimationCollective,
  RdvEtAnimationCollectivePilotage,
} from 'interfaces/evenement'
import { estMilo } from 'interfaces/structure'
import {
  getActionsAQualifierServerSide,
  getSituationsNonProfessionnelles,
} from 'services/actions.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getRdvsEtAnimationsCollectivesACloreServerSide } from 'services/evenements.service'
import {
  getSessionsACloreServerSide,
  SessionsAClore,
} from 'services/sessions.service'
import { MetadonneesPagination, MetadonneesPilotage } from 'types/pagination'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

export const metadata: Metadata = {
  title: 'Pilotage',
}

type PilotageSearchParams = Promise<Partial<{ onglet: string }>>
export default async function Pilotage({
  searchParams,
}: {
  searchParams?: PilotageSearchParams
}) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estMilo(user.structure)) notFound()

  const [conseiller, actions, categoriesActions] = await Promise.all([
    getConseillerServerSide(user, accessToken),
    getActionsAQualifierServerSide(user.id, accessToken),
    getSituationsNonProfessionnelles({ avecNonSNP: false }, accessToken),
  ])

  const evenements: {
    rdvsEtAnimationsCollectivesInitiaux: RdvEtAnimationCollectivePilotage[]
    metadonnees: MetadonneesPagination
  } = await getRdvsEtAnimationsCollectivesACloreServerSide(
    conseiller.id,
    accessToken
  )

  let sessions: SessionsAClore[] | undefined

  if (peutAccederAuxSessions(conseiller)) {
    try {
      sessions = await getSessionsACloreServerSide(user.id, accessToken)
    } catch {
      sessions = undefined
    }
  }

  let onglet: Onglet = 'ACTIONS'
  switch ((await searchParams)?.onglet) {
    case 'animationsCollectives':
      onglet = 'RDVS_ET_AC'
      break
    case 'sessionsImilo':
      onglet = 'SESSIONS_IMILO'
      break
    case 'archivage':
      onglet = 'ARCHIVAGE'
      break
  }

  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header='Pilotage' />

      <PilotagePage
        actions={{ donnees: actions.actions, metadonnees: actions.metadonnees }}
        categoriesActions={categoriesActions}
        rdvsEtAnimationsCollectivesInitiaux={
          evenements && {
            donnees: evenements.rdvsEtAnimationsCollectivesInitiaux,
            metadonnees: calculerMetadonnees(evenements),
          }
        }
        sessions={sessions}
        onglet={onglet}
      />
    </>
  )
}

function calculerMetadonnees(evenements: {
  rdvsEtAnimationsCollectivesInitiaux: RdvEtAnimationCollectivePilotage[]
  metadonnees: MetadonneesPagination
}): MetadonneesPilotage {
  const nombreAnimationsCollectivesAClore =
    evenements.rdvsEtAnimationsCollectivesInitiaux.filter((evenement) =>
      isCodeTypeAnimationCollective(evenement.type)
    ).length
  const nombreRdvsAClore =
    evenements.metadonnees.nombreTotal - nombreAnimationsCollectivesAClore

  return {
    nombreAC: nombreAnimationsCollectivesAClore,
    nombreRdvs: nombreRdvsAClore,
    ...evenements.metadonnees,
  }
}
