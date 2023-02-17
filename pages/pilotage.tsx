import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { OngletActionsPilotage } from 'components/pilotage/OngletActionsPilotage'
import { OngletEvenementsPilotage } from 'components/pilotage/OngletEvenementsPilotage'
import { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { ActionPilotage, MetadonneesActions } from 'interfaces/action'
import {
  AnimationCollectivePilotage,
  MetadonneesAnimationsCollectives,
} from 'interfaces/evenement'
import { PageProps } from 'interfaces/pageProps'
import { ActionsService } from 'services/actions.service'
import { ConseillerService } from 'services/conseiller.service'
import { EvenementsService } from 'services/evenements.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

type PilotageProps = PageProps & {
  actions: { donnees: ActionPilotage[]; metadonnees: MetadonneesActions }
  evenements?: {
    donnees: AnimationCollectivePilotage[]
    metadonnees: MetadonneesAnimationsCollectives
  }
  onglet?: Onglet
}

export enum Onglet {
  ACTIONS = 'ACTIONS',
  ANIMATIONS_COLLECTIVES = 'ANIMATIONS_COLLECTIVES',
}

const ongletProps: {
  [key in Onglet]: { queryParam: string; trackingLabel: string }
} = {
  ACTIONS: { queryParam: 'actions', trackingLabel: 'Actions' },
  ANIMATIONS_COLLECTIVES: {
    queryParam: 'evenements',
    trackingLabel: 'Animations collectives',
  },
}

function Pilotage({ actions, evenements, onglet }: PilotageProps) {
  const actionsService = useDependance<ActionsService>('actionsService')
  const evenementsService =
    useDependance<EvenementsService>('evenementsService')
  const [conseiller] = useConseiller()
  const router = useRouter()

  const [currentTab, setCurrentTab] = useState<Onglet>(onglet ?? Onglet.ACTIONS)
  const [totalActions, setTotalActions] = useState<number>(
    actions.metadonnees.nombreTotal
  )
  const [totalEvenements, setTotalEvenements] = useState<number>(
    evenements?.metadonnees.nombreTotal ?? 0
  )

  const pageTracking = 'Pilotage'
  const [trackingLabel, setTrackingLabel] = useState<string>(
    pageTracking + ' - Consultation ' + ongletProps[currentTab].trackingLabel
  )

  async function chargerActions(
    page: number
  ): Promise<{ actions: ActionPilotage[]; metadonnees: MetadonneesActions }> {
    const result = await actionsService.getActionsAQualifierClientSide(
      conseiller!.id,
      page
    )

    setTotalActions(result.metadonnees.nombreTotal)
    return result
  }

  async function chargerEvenements(page: number): Promise<{
    evenements: AnimationCollectivePilotage[]
    metadonnees: MetadonneesActions
  }> {
    const result = await evenementsService.getRendezVousACloreClientSide(
      conseiller!.agence!.id!,
      page
    )

    setTotalEvenements(result.metadonnees.nombreTotal)
    return result
  }

  async function switchTab(tab: Onglet) {
    setTrackingLabel(
      pageTracking + ' - Consultation ' + ongletProps[tab].trackingLabel
    )
    await router.replace(
      {
        pathname: `/pilotage`,
        query: { onglet: ongletProps[tab].queryParam },
      },
      undefined,
      {
        shallow: true,
      }
    )

    setCurrentTab(tab)
  }

  useMatomo(trackingLabel)

  return (
    <div>
      <TabList className='mt-10'>
        <Tab
          label='Actions à qualifier'
          count={totalActions}
          selected={currentTab === Onglet.ACTIONS}
          controls='liste-actions-à-qualifier'
          onSelectTab={() => switchTab(Onglet.ACTIONS)}
          iconName={IconName.Calendar}
        />
        <Tab
          label='Animations à clore'
          count={totalEvenements}
          selected={currentTab === Onglet.ANIMATIONS_COLLECTIVES}
          controls='liste-animations-collectives-à-clore'
          onSelectTab={() => switchTab(Onglet.ANIMATIONS_COLLECTIVES)}
          iconName={IconName.Calendar}
        />
      </TabList>

      {currentTab === Onglet.ACTIONS && (
        <div
          role='tabpanel'
          aria-labelledby='liste-actions-à-qualifier--tab'
          tabIndex={0}
          id='liste-actions-à-qualifier'
          className='mt-6 pb-8 border-b border-primary_lighten'
        >
          <OngletActionsPilotage
            actionsInitiales={actions.donnees}
            metadonneesInitiales={actions.metadonnees}
            getActions={chargerActions}
          />
        </div>
      )}

      {currentTab === Onglet.ANIMATIONS_COLLECTIVES && (
        <div
          role='tabpanel'
          aria-labelledby='liste-animations-collectives-à-clore--tab'
          tabIndex={0}
          id='liste-animations-collectives-à-clore'
          className='mt-8 pb-8 border-b border-primary_lighten'
        >
          <OngletEvenementsPilotage
            evenementsInitiaux={evenements?.donnees}
            metadonneesInitiales={evenements?.metadonnees}
            getEvenements={chargerEvenements}
          />
        </div>
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<PilotageProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const actionsService = withDependance<ActionsService>('actionsService')
  const conseillerService =
    withDependance<ConseillerService>('conseillerService')
  const evenementsService =
    withDependance<EvenementsService>('evenementsService')

  const {
    session: { accessToken, user },
  } = sessionOrRedirect

  const [actions, evenements] = await Promise.all([
    actionsService.getActionsAQualifierServerSide(user.id, accessToken),
    conseillerService
      .getConseillerServerSide(user, accessToken)
      .then((conseiller) => {
        if (!conseiller?.agence?.id) return
        return evenementsService.getRendezVousACloreServerSide(
          conseiller.agence.id,
          accessToken
        )
      }),
  ])

  const props: PilotageProps = {
    pageTitle: 'Pilotage',
    actions: {
      donnees: actions.actions,
      metadonnees: actions.metadonnees,
    },
  }

  if (evenements) {
    props.evenements = {
      donnees: evenements.evenements,
      metadonnees: evenements.metadonnees,
    }
  }

  if (context.query.onglet) {
    switch (context.query.onglet) {
      case 'evenements':
        props.onglet = Onglet.ANIMATIONS_COLLECTIVES
        break
      case 'actions':
      default:
        props.onglet = Onglet.ACTIONS
    }
  }

  return { props }
}

export default withTransaction(Pilotage.name, 'page')(Pilotage)
