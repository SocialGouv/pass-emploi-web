import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import EncartAgenceRequise from 'components/EncartAgenceRequise'
import { OngletActionsPilotage } from 'components/pilotage/OngletActionsPilotage'
import { OngletAnimationsCollectivesPilotage } from 'components/pilotage/OngletAnimationsCollectivesPilotage'
import { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { ActionPilotage } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import { AnimationCollectivePilotage } from 'interfaces/evenement'
import { PageProps } from 'interfaces/pageProps'
import { ActionsService } from 'services/actions.service'
import { ConseillerService } from 'services/conseiller.service'
import { EvenementsService } from 'services/evenements.service'
import { ReferentielService } from 'services/referentiel.service'
import { MetadonneesPagination } from 'types/pagination'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

export enum Onglet {
  ACTIONS = 'ACTIONS',
  ANIMATIONS_COLLECTIVES = 'ANIMATIONS_COLLECTIVES',
}

const ongletProps: {
  [key in Onglet]: { queryParam: string; trackingLabel: string }
} = {
  ACTIONS: { queryParam: 'actions', trackingLabel: 'Actions' },
  ANIMATIONS_COLLECTIVES: {
    queryParam: 'animationsCollectives',
    trackingLabel: 'Animations collectives',
  },
}

type PilotageProps = PageProps & {
  actions: { donnees: ActionPilotage[]; metadonnees: MetadonneesPagination }
  animationsCollectives?: {
    donnees: AnimationCollectivePilotage[]
    metadonnees: MetadonneesPagination
  }
  onglet?: Onglet
}

function Pilotage({ actions, animationsCollectives, onglet }: PilotageProps) {
  const actionsService = useDependance<ActionsService>('actionsService')
  const referentielService =
    useDependance<ReferentielService>('referentielService')
  const evenementsService =
    useDependance<EvenementsService>('evenementsService')
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')
  const [conseiller, setConseiller] = useConseiller()
  const router = useRouter()

  const [currentTab, setCurrentTab] = useState<Onglet>(onglet ?? Onglet.ACTIONS)
  const [totalActions, setTotalActions] = useState<number>(
    actions.metadonnees.nombreTotal
  )
  const [totalAnimationsCollectives, setTotalAnimationsCollectives] =
    useState<number>(animationsCollectives?.metadonnees.nombreTotal ?? 0)

  const [animationsCollectivesAffichees, setAnimationsCollectivesAffichees] =
    useState<
      | {
          donnees: AnimationCollectivePilotage[]
          metadonnees: MetadonneesPagination
        }
      | undefined
    >(animationsCollectives)

  const pageTracking = 'Pilotage'
  const [trackingLabel, setTrackingLabel] = useState<string>(
    pageTracking + ' - Consultation ' + ongletProps[currentTab].trackingLabel
  )

  async function chargerActions(page: number): Promise<{
    actions: ActionPilotage[]
    metadonnees: MetadonneesPagination
  }> {
    const result = await actionsService.getActionsAQualifierClientSide(
      conseiller.id,
      page
    )

    setTotalActions(result.metadonnees.nombreTotal)
    return result
  }

  async function chargerAnimationsCollectives(page: number): Promise<{
    animationsCollectives: AnimationCollectivePilotage[]
    metadonnees: MetadonneesPagination
  }> {
    const result =
      await evenementsService.getAnimationsCollectivesACloreClientSide(
        conseiller.agence!.id!,
        page
      )

    setTotalAnimationsCollectives(result.metadonnees.nombreTotal)
    return result
  }

  async function renseignerAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    await conseillerService.modifierAgence(agence)
    setConseiller({ ...conseiller, agence })
    setTrackingLabel(pageTracking + ' - Succès ajout agence')
  }

  function trackAgenceModal(trackingMessage: string) {
    setTrackingLabel(pageTracking + ' - ' + trackingMessage)
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

  useEffect(() => {
    if (conseiller.agence?.id && !animationsCollectivesAffichees) {
      evenementsService
        .getAnimationsCollectivesACloreClientSide(conseiller.agence.id, 1)
        .then((result) => {
          setAnimationsCollectivesAffichees({
            donnees: result.animationsCollectives,
            metadonnees: result.metadonnees,
          })
          setTotalAnimationsCollectives(result.metadonnees.nombreTotal)
        })
    }
  }, [conseiller.agence?.id])

  useMatomo(trackingLabel)

  return (
    <>
      <div className='border border-solid border-grey_100 p-4'>
        <h2 className='text-m-bold text-grey_800'>Nouvelles activités</h2>

        <dl className='mt-4 flex gap-8'>
          <div>
            <dt className='text-base-bold'>Les actions</dt>
            <dd className='mt-2 rounded-base px-3 py-2 bg-primary_lighten text-primary_darken'>
              <div className='text-xl-bold'>{totalActions}</div>
              <span className='text-base-bold'> À qualifier</span>
            </dd>
          </div>
          {conseiller.agence?.id && (
            <div>
              <dt className='text-base-bold'>Les animations</dt>
              <dd className='mt-2 rounded-base px-3 py-2 bg-primary_lighten text-primary_darken'>
                <div className='text-xl-bold'>{totalAnimationsCollectives}</div>
                <span className='text-base-bold'> À clore</span>
              </dd>
            </div>
          )}
        </dl>
      </div>

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
          count={conseiller.agence?.id ? totalAnimationsCollectives : undefined}
          selected={currentTab === Onglet.ANIMATIONS_COLLECTIVES}
          controls='liste-animations-collectives-a-clore'
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
          aria-labelledby='liste-animations-collectives-a-clore--tab'
          tabIndex={0}
          id='liste-animations-collectives-a-clore'
          className='mt-8 pb-8 border-b border-primary_lighten'
        >
          {!animationsCollectivesAffichees && (
            <EncartAgenceRequise
              conseiller={conseiller}
              onAgenceChoisie={renseignerAgence}
              getAgences={referentielService.getAgencesClientSide.bind(
                referentielService
              )}
              onChangeAffichageModal={trackAgenceModal}
            />
          )}

          {animationsCollectivesAffichees && (
            <OngletAnimationsCollectivesPilotage
              animationsCollectivesInitiales={
                animationsCollectivesAffichees?.donnees
              }
              metadonneesInitiales={animationsCollectivesAffichees?.metadonnees}
              getAnimationsCollectives={chargerAnimationsCollectives}
            />
          )}
        </div>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<PilotageProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { accessToken, user },
  } = sessionOrRedirect
  if (user.structure === StructureConseiller.POLE_EMPLOI)
    return { notFound: true }

  const actionsService = withDependance<ActionsService>('actionsService')
  const conseillerService =
    withDependance<ConseillerService>('conseillerService')
  const evenementsService =
    withDependance<EvenementsService>('evenementsService')

  const [actions, evenements] = await Promise.all([
    actionsService.getActionsAQualifierServerSide(user.id, accessToken),
    conseillerService
      .getConseillerServerSide(user, accessToken)
      .then((conseiller) => {
        if (!conseiller?.agence?.id) return
        return evenementsService.getAnimationsCollectivesACloreServerSide(
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
    props.animationsCollectives = {
      donnees: evenements.animationsCollectives,
      metadonnees: evenements.metadonnees,
    }
  }

  if (context.query.onglet) {
    switch (context.query.onglet) {
      case 'animationsCollectives':
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
