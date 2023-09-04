import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { ActionPilotage } from 'interfaces/action'
import { estEarlyAdopter, estUserPoleEmploi } from 'interfaces/conseiller'
import { AnimationCollectivePilotage } from 'interfaces/evenement'
import { PageProps } from 'interfaces/pageProps'
import { getAnimationsCollectivesACloreClientSide } from 'services/evenements.service'
import { getAgencesClientSide } from 'services/referentiel.service'
import { SessionsAClore } from 'services/sessions.service'
import { MetadonneesPagination } from 'types/pagination'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

const OngletActionsPilotage = dynamic(
  import('components/pilotage/OngletActionsPilotage')
)
const OngletAnimationsCollectivesPilotage = dynamic(
  import('components/pilotage/OngletAnimationsCollectivesPilotage')
)
const OngletSessionsImiloPilotage = dynamic(
  import('components/pilotage/OngletSessionsImiloPilotage')
)
const EncartAgenceRequise = dynamic(import('components/EncartAgenceRequise'))

export enum Onglet {
  ACTIONS = 'ACTIONS',
  ANIMATIONS_COLLECTIVES = 'ANIMATIONS_COLLECTIVES',
  SESSIONS_IMILO = 'SESSIONS_IMILO',
}

const ongletProps: {
  [key in Onglet]: { queryParam: string; trackingLabel: string }
} = {
  ACTIONS: { queryParam: 'actions', trackingLabel: 'Actions' },
  ANIMATIONS_COLLECTIVES: {
    queryParam: 'animationsCollectives',
    trackingLabel: 'Animations collectives',
  },
  SESSIONS_IMILO: {
    queryParam: 'sessionsImilo',
    trackingLabel: 'Sessions i-milo',
  },
}

type PilotageProps = PageProps & {
  actions: { donnees: ActionPilotage[]; metadonnees: MetadonneesPagination }
  animationsCollectives?: {
    donnees: AnimationCollectivePilotage[]
    metadonnees: MetadonneesPagination
  }
  sessions?: SessionsAClore[]
  onglet?: Onglet
}

function Pilotage({
  actions,
  animationsCollectives,
  sessions,
  onglet,
}: PilotageProps) {
  const [conseiller, setConseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const router = useRouter()

  const [currentTab, setCurrentTab] = useState<Onglet>(onglet ?? Onglet.ACTIONS)
  const [totalActions, setTotalActions] = useState<number>(
    actions.metadonnees.nombreTotal
  )
  const [totalAnimationsCollectives, setTotalAnimationsCollectives] =
    useState<number>(animationsCollectives?.metadonnees.nombreTotal ?? 0)

  const [totalSessionsImilo] = useState<number>(sessions?.length ?? 0)

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

  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  async function chargerActions(page: number): Promise<{
    actions: ActionPilotage[]
    metadonnees: MetadonneesPagination
  }> {
    const { getActionsAQualifierClientSide } = await import(
      'services/actions.service'
    )
    const result = await getActionsAQualifierClientSide(conseiller.id, page)

    setTotalActions(result.metadonnees.nombreTotal)
    return result
  }

  async function chargerAnimationsCollectives(page: number): Promise<{
    animationsCollectives: AnimationCollectivePilotage[]
    metadonnees: MetadonneesPagination
  }> {
    const result = await getAnimationsCollectivesACloreClientSide(
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
    const { modifierAgence } = await import('services/conseiller.service')
    await modifierAgence(agence)
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
      getAnimationsCollectivesACloreClientSide(conseiller.agence.id, 1).then(
        (result) => {
          setAnimationsCollectivesAffichees({
            donnees: result.animationsCollectives,
            metadonnees: result.metadonnees,
          })
          setTotalAnimationsCollectives(result.metadonnees.nombreTotal)
        }
      )
    }
  }, [conseiller.agence?.id])

  useMatomo(trackingLabel, aDesBeneficiaires)

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
            <>
              <div>
                <dt className='text-base-bold'>Les animations</dt>
                <dd className='mt-2 rounded-base px-3 py-2 bg-primary_lighten text-primary_darken'>
                  <div className='text-xl-bold'>
                    {totalAnimationsCollectives}
                  </div>
                  <span className='text-base-bold'> À clore</span>
                </dd>
              </div>
              {process.env.ENABLE_SESSIONS_MILO &&
                estEarlyAdopter(conseiller) && (
                  <div>
                    <dt className='text-base-bold'>Sessions i-milo</dt>
                    <dd className='mt-2 rounded-base px-3 py-2 bg-primary_lighten text-primary_darken'>
                      <div className='text-xl-bold'>{totalSessionsImilo}</div>
                      <span className='text-base-bold'> À clore</span>
                    </dd>
                  </div>
                )}
            </>
          )}
        </dl>
      </div>

      <TabList className='mt-10'>
        <Tab
          label='Actions'
          count={totalActions}
          selected={currentTab === Onglet.ACTIONS}
          controls='liste-actions-à-qualifier'
          onSelectTab={() => switchTab(Onglet.ACTIONS)}
          iconName={IconName.EventFill}
        />
        <Tab
          label='AC app CEJ'
          count={conseiller.agence?.id ? totalAnimationsCollectives : undefined}
          selected={currentTab === Onglet.ANIMATIONS_COLLECTIVES}
          controls='liste-animations-collectives-a-clore'
          onSelectTab={() => switchTab(Onglet.ANIMATIONS_COLLECTIVES)}
          iconName={IconName.EventFill}
        />
        {process.env.ENABLE_SESSIONS_MILO && estEarlyAdopter(conseiller) && (
          <Tab
            label='Sessions i-milo'
            count={totalSessionsImilo ?? undefined}
            selected={currentTab === Onglet.SESSIONS_IMILO}
            controls='liste-sessions-i-milo-a-clore'
            onSelectTab={() => switchTab(Onglet.SESSIONS_IMILO)}
            iconName={IconName.EventFill}
          />
        )}
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
              getAgences={getAgencesClientSide}
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

      {currentTab === Onglet.SESSIONS_IMILO &&
        process.env.ENABLE_SESSIONS_MILO &&
        estEarlyAdopter(conseiller) && (
          <div
            role='tabpanel'
            aria-labelledby='liste-sessions-i-milo-a-clore--tab'
            tabIndex={0}
            id='liste-sessions-i-milo-a-clore'
            className='mt-8 pb-8 border-b border-primary_lighten'
          >
            {!animationsCollectivesAffichees && (
              <EncartAgenceRequise
                conseiller={conseiller}
                onAgenceChoisie={renseignerAgence}
                getAgences={getAgencesClientSide}
                onChangeAffichageModal={trackAgenceModal}
              />
            )}

            {sessions && <OngletSessionsImiloPilotage sessions={sessions} />}
          </div>
        )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<PilotageProps> = async (
  context
) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { accessToken, user },
  } = sessionOrRedirect
  if (estUserPoleEmploi(user)) return { notFound: true }

  const { getActionsAQualifierServerSide } = await import(
    'services/actions.service'
  )
  const { getConseillerServerSide } = await import(
    'services/conseiller.service'
  )
  const { getAnimationsCollectivesACloreServerSide } = await import(
    'services/evenements.service'
  )
  const { getSessionsACloreServerSide } = await import(
    'services/sessions.service'
  )

  const conseiller = await getConseillerServerSide(user, accessToken)

  const actions = await getActionsAQualifierServerSide(user.id, accessToken)

  let evenements, sessions

  if (conseiller?.agence?.id)
    evenements = await getAnimationsCollectivesACloreServerSide(
      conseiller.agence.id,
      accessToken
    )

  if (
    process.env.ENABLE_SESSIONS_MILO ||
    (conseiller && estEarlyAdopter(conseiller))
  ) {
    sessions = await getSessionsACloreServerSide(user.id, accessToken)
  }

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

  if (sessions) {
    props.sessions = sessions
  }

  if (context.query.onglet) {
    switch (context.query.onglet) {
      case 'animationsCollectives':
        props.onglet = Onglet.ANIMATIONS_COLLECTIVES
        break
      case 'sessionsImilo':
        props.onglet = Onglet.SESSIONS_IMILO
        break
      case 'actions':
      default:
        props.onglet = Onglet.ACTIONS
    }
  }

  return { props }
}

export default withTransaction(Pilotage.name, 'page')(Pilotage)
