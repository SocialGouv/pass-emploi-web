'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { ActionPilotage, SituationNonProfessionnelle } from 'interfaces/action'
import { peutAccederAuxSessions } from 'interfaces/conseiller'
import { AnimationCollectivePilotage } from 'interfaces/evenement'
import { TriActionsAQualifier } from 'services/actions.service'
import { getAnimationsCollectivesACloreClientSide } from 'services/evenements.service'
import { getAgencesClientSide } from 'services/referentiel.service'
import { SessionsAClore } from 'services/sessions.service'
import { MetadonneesPagination } from 'types/pagination'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

const OngletActionsPilotage = dynamic(
  () => import('components/pilotage/OngletActionsPilotage')
)
const OngletAnimationsCollectivesPilotage = dynamic(
  () => import('components/pilotage/OngletAnimationsCollectivesPilotage')
)
const OngletSessionsImiloPilotage = dynamic(
  () => import('components/pilotage/OngletSessionsImiloPilotage')
)
const EncartAgenceRequise = dynamic(
  () => import('components/EncartAgenceRequise')
)

export type Onglet = 'ACTIONS' | 'ANIMATIONS_COLLECTIVES' | 'SESSIONS_IMILO'

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

type PilotageProps = {
  actions: { donnees: ActionPilotage[]; metadonnees: MetadonneesPagination }
  categoriesActions: SituationNonProfessionnelle[]
  onglet: Onglet
  sessions?: SessionsAClore[]
  animationsCollectives?: {
    donnees: AnimationCollectivePilotage[]
    metadonnees: MetadonneesPagination
  }
}

function PilotagePage({
  actions,
  animationsCollectives,
  sessions,
  categoriesActions,
  onglet,
}: PilotageProps) {
  const [conseiller, setConseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const router = useRouter()

  const [currentTab, setCurrentTab] = useState<Onglet>(onglet)
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

  async function chargerActions(options: {
    page: number
    tri?: TriActionsAQualifier
    filtres?: string[]
  }): Promise<{
    actions: ActionPilotage[]
    metadonnees: MetadonneesPagination
  }> {
    const { getActionsAQualifierClientSide } = await import(
      'services/actions.service'
    )
    const result = await getActionsAQualifierClientSide(conseiller.id, options)

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
    const { modifierAgence } = await import('services/conseillers.service')
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
    router.replace('pilotage?onglet=' + ongletProps[tab].queryParam)
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

  useMatomo(trackingLabel, portefeuille.length > 0)

  return (
    <>
      <div className='border border-solid border-grey_100 p-4'>
        <h2 className='text-m-bold text-grey_800'>Nouvelles activités</h2>

        <dl className='mt-4 flex gap-8'>
          <div>
            <dt className='text-base-bold'>Les actions</dt>
            <dd className='mt-2 rounded-base px-3 py-2 bg-primary_lighten text-primary_darken'>
              <div className='text-xl-bold'>
                {actions.metadonnees.nombreTotal}
              </div>
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
              {peutAccederAuxSessions(conseiller) && (
                <div>
                  <dt className='text-base-bold'>Sessions i-milo</dt>
                  {!sessions && (
                    <dd className='mt-2 rounded-base px-3 py-2 text-warning bg-warning_lighten'>
                      <div className='text-xl-bold flex gap-2 items-center'>
                        <IconComponent
                          name={IconName.Error}
                          focusable={false}
                          aria-hidden={true}
                          className='w-4 h-4 fill-warning'
                        />
                        Erreur
                      </div>
                      <span className='text-base-bold'>
                        Impossible de récupérer les sessions
                      </span>
                    </dd>
                  )}
                  {sessions && (
                    <dd className='mt-2 rounded-base px-3 py-2 bg-primary_lighten text-primary_darken'>
                      <div className='text-xl-bold'>{sessions?.length}</div>
                      <span className='text-base-bold'> À clore</span>
                    </dd>
                  )}
                </div>
              )}
            </>
          )}
        </dl>
      </div>

      <TabList label='Activités à qualifier ou émarger' className='mt-10'>
        <Tab
          label='Actions'
          count={totalActions}
          selected={currentTab === 'ACTIONS'}
          controls='liste-actions-à-qualifier'
          onSelectTab={() => switchTab('ACTIONS')}
          iconName={IconName.EventFill}
        />
        <Tab
          label='AC app CEJ'
          ariaLabel='Animations collectives de l’application du CEJ'
          count={conseiller.agence?.id ? totalAnimationsCollectives : undefined}
          selected={currentTab === 'ANIMATIONS_COLLECTIVES'}
          controls='liste-animations-collectives-a-clore'
          onSelectTab={() => switchTab('ANIMATIONS_COLLECTIVES')}
          iconName={IconName.EventFill}
        />
        {peutAccederAuxSessions(conseiller) && sessions !== null && (
          <Tab
            label='Sessions i-milo'
            count={sessions?.length}
            selected={currentTab === 'SESSIONS_IMILO'}
            controls='liste-sessions-i-milo-a-clore'
            onSelectTab={() => switchTab('SESSIONS_IMILO')}
            iconName={IconName.EventFill}
          />
        )}
      </TabList>

      {currentTab === 'ACTIONS' && (
        <div
          role='tabpanel'
          aria-labelledby='liste-actions-à-qualifier--tab'
          tabIndex={0}
          id='liste-actions-à-qualifier'
          className='mt-6 pb-8 border-b border-primary_lighten'
        >
          <OngletActionsPilotage
            categories={categoriesActions}
            actionsInitiales={actions.donnees}
            metadonneesInitiales={actions.metadonnees}
            getActions={chargerActions}
            onLienExterne={setTrackingLabel}
          />
        </div>
      )}

      {currentTab === 'ANIMATIONS_COLLECTIVES' && (
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

      {currentTab === 'SESSIONS_IMILO' &&
        peutAccederAuxSessions(conseiller) &&
        sessions !== null && (
          <div
            role='tabpanel'
            aria-labelledby='liste-sessions-i-milo-a-clore--tab'
            tabIndex={0}
            id='liste-sessions-i-milo-a-clore'
            className='mt-8 pb-8 border-b border-primary_lighten'
          >
            {sessions && <OngletSessionsImiloPilotage sessions={sessions} />}
          </div>
        )}
    </>
  )
}

export default withTransaction(PilotagePage.name, 'page')(PilotagePage)
