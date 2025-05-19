'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { ActionPilotage, SituationNonProfessionnelle } from 'interfaces/action'
import { peutAccederAuxSessions } from 'interfaces/conseiller'
import {
  RdvEtAnimationCollectivePilotage,
  isCodeTypeAnimationCollective,
} from 'interfaces/evenement'
import { TriActionsAQualifier } from 'services/actions.service'
import { getRdvsEtAnimationsCollectivesACloreClientSide } from 'services/evenements.service'
import { getMissionsLocalesClientSide } from 'services/referentiel.service'
import { SessionsAClore } from 'services/sessions.service'
import { MetadonneesPagination, MetadonneesPilotage } from 'types/pagination'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

const OngletActionsPilotage = dynamic(
  () => import('components/pilotage/OngletActionsPilotage')
)
const OngletRdvsEtAnimationsCollectivesPilotage = dynamic(
  () => import('components/pilotage/OngletRdvsEtAnimationsCollectivesPilotage')
)
const OngletSessionsImiloPilotage = dynamic(
  () => import('components/pilotage/OngletSessionsImiloPilotage')
)
const OngletBeneficiairesAArchiverPilotage = dynamic(
  () => import('components/pilotage/OngletBeneficiairesAArchiverPilotage')
)
const EncartMissionLocaleRequise = dynamic(
  () => import('components/EncartMissionLocaleRequise')
)

export type Onglet = 'ACTIONS' | 'RDVS_ET_AC' | 'SESSIONS_IMILO' | 'ARCHIVAGE'

const ongletProps: {
  [key in Onglet]: { queryParam: string; trackingLabel: string }
} = {
  ACTIONS: { queryParam: 'actions', trackingLabel: 'Actions' },
  RDVS_ET_AC: {
    queryParam: 'rdvsEtAnimationsCollectives',
    trackingLabel: 'Animations collectives',
  },
  SESSIONS_IMILO: {
    queryParam: 'sessionsImilo',
    trackingLabel: 'Sessions i-milo',
  },
  ARCHIVAGE: {
    queryParam: 'archivage',
    trackingLabel: 'Archivage bénéficiaires',
  },
}

type PilotageProps = {
  actions: { donnees: ActionPilotage[]; metadonnees: MetadonneesPagination }
  categoriesActions: SituationNonProfessionnelle[]
  onglet: Onglet
  sessions?: SessionsAClore[]
  rdvsEtAnimationsCollectivesInitiaux?: {
    donnees: RdvEtAnimationCollectivePilotage[]
    metadonnees: MetadonneesPilotage
  }
}

function PilotagePage({
  actions,
  rdvsEtAnimationsCollectivesInitiaux,
  sessions,
  categoriesActions,
  onglet,
}: PilotageProps) {
  const [conseiller, setConseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const router = useRouter()

  const [currentTab, setCurrentTab] = useState<Onglet>(onglet)

  const totalAnimationsCollectives = rdvsEtAnimationsCollectivesInitiaux
    ? calculeNombreAC(rdvsEtAnimationsCollectivesInitiaux.donnees)
    : 0

  const totalRdv = rdvsEtAnimationsCollectivesInitiaux?.metadonnees.nombreTotal
    ? rdvsEtAnimationsCollectivesInitiaux?.metadonnees.nombreTotal -
      totalAnimationsCollectives
    : 0

  const [animationsCollectivesAffichees, setAnimationsCollectivesAffichees] =
    useState<
      | {
          donnees: RdvEtAnimationCollectivePilotage[]
          metadonnees: MetadonneesPilotage
        }
      | undefined
    >(rdvsEtAnimationsCollectivesInitiaux)

  const beneficiairesAArchiver = portefeuille.filter(
    (beneficiaire) => beneficiaire.estAArchiver
  )
  const nbBeneficiairesAArchiver = beneficiairesAArchiver.length
  const aDesBeneficiairesAArchiver = nbBeneficiairesAArchiver > 0

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

    return getActionsAQualifierClientSide(conseiller.id, options)
  }

  async function chargerRdvsEtAC(page: number): Promise<{
    rdvsEtAnimationsCollectivesInitiaux: RdvEtAnimationCollectivePilotage[]
    metadonnees: MetadonneesPilotage
  }> {
    const result = await getRdvsEtAnimationsCollectivesACloreClientSide(
      conseiller.id,
      page
    )

    const nombreAC = calculeNombreAC(result.rdvsEtAnimationsCollectivesInitiaux)

    return {
      rdvsEtAnimationsCollectivesInitiaux:
        result.rdvsEtAnimationsCollectivesInitiaux,
      metadonnees: {
        nombreAC,
        nombreRdvs: result.metadonnees.nombreTotal - nombreAC,
        ...result.metadonnees,
      },
    }
  }

  async function renseignerMissionLocale(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    const { modifierAgence } = await import('services/conseiller.service')
    await modifierAgence(agence)
    setConseiller({ ...conseiller, agence })
    setTrackingLabel(pageTracking + ' - Succès ajout agence')
  }

  function calculeNombreAC(evenements: RdvEtAnimationCollectivePilotage[]) {
    return evenements.filter((evenement) =>
      isCodeTypeAnimationCollective(evenement.type)
    ).length
  }

  function trackAgenceModal(trackingMessage: string) {
    setTrackingLabel(pageTracking + ' - ' + trackingMessage)
  }

  async function switchTab(tab: Onglet) {
    setTrackingLabel(
      pageTracking + ' - Consultation ' + ongletProps[tab].trackingLabel
    )
    router.replace('pilotage?onglet=' + ongletProps[tab].queryParam, {
      scroll: false,
    })
    setCurrentTab(tab)
  }

  useEffect(() => {
    if (conseiller.agence?.id && !animationsCollectivesAffichees) {
      getRdvsEtAnimationsCollectivesACloreClientSide(conseiller.id, 1).then(
        (result) => {
          const nombreAC = calculeNombreAC(
            result.rdvsEtAnimationsCollectivesInitiaux
          )

          setAnimationsCollectivesAffichees({
            donnees: result.rdvsEtAnimationsCollectivesInitiaux,
            metadonnees: {
              nombreAC,
              nombreRdvs: result.metadonnees.nombreTotal - nombreAC,
              ...result.metadonnees,
            },
          })
        }
      )
    }
  }, [conseiller.agence?.id])

  useMatomo(trackingLabel, portefeuille.length > 0)

  return (
    <>
      <div className='border border-solid border-grey-100 p-4'>
        <h2 className='text-m-bold text-grey-800'>Nouvelles activités</h2>

        <dl className='mt-4 flex gap-8'>
          <div>
            <dt className='text-base-bold'>Les actions</dt>
            <dd className='mt-2 rounded-base px-3 py-2 bg-primary-lighten text-primary-darken'>
              <div className='text-xl-bold'>
                {actions.metadonnees.nombreTotal}
              </div>
              <span className='text-base-bold'> À qualifier</span>
            </dd>
          </div>

          {conseiller.agence?.id && (
            <>
              <div>
                <dt className='text-base-bold'>Les rendez-vous</dt>
                <dd className='mt-2 rounded-base px-3 py-2 bg-primary-lighten text-primary-darken'>
                  <div className='text-xl-bold'>{totalRdv}</div>
                  <span className='text-base-bold'> À clore</span>
                </dd>
              </div>

              <div>
                <dt className='text-base-bold'>Les animations</dt>
                <dd className='mt-2 rounded-base px-3 py-2 bg-primary-lighten text-primary-darken'>
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
                    <dd className='mt-2 rounded-base px-3 py-2 text-warning bg-warning-lighten'>
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
                    <dd className='mt-2 rounded-base px-3 py-2 bg-primary-lighten text-primary-darken'>
                      <div className='text-xl-bold'>{sessions?.length}</div>
                      <span className='text-base-bold'> À clore</span>
                    </dd>
                  )}
                </div>
              )}
            </>
          )}

          <div>
            <dt className='text-base-bold'>Bénéficiaires</dt>
            <dd
              className={`mt-2 rounded-base px-3 py-2 ${aDesBeneficiairesAArchiver ? 'bg-warning-lighten text-warning' : 'bg-primary-lighten text-primary-darken'}`}
            >
              <div className='text-xl-bold'>{nbBeneficiairesAArchiver}</div>
              <span className='text-base-bold'> À archiver</span>
            </dd>
          </div>
        </dl>
      </div>

      <TabList label='Activités à qualifier ou émarger' className='mt-10'>
        <Tab
          label='Actions'
          selected={currentTab === 'ACTIONS'}
          controls='liste-actions-à-qualifier'
          onSelectTab={() => switchTab('ACTIONS')}
          iconName={IconName.EventFill}
        />
        <Tab
          label='Rdvs et AC app CEJ'
          ariaLabel='Rendez-vous et animations collectives de l’application du CEJ'
          selected={currentTab === 'RDVS_ET_AC'}
          controls='liste-rdvs-et-ac-a-clore'
          onSelectTab={() => switchTab('RDVS_ET_AC')}
          iconName={IconName.EventFill}
        />
        {peutAccederAuxSessions(conseiller) && sessions !== null && (
          <Tab
            label='Sessions i-milo'
            selected={currentTab === 'SESSIONS_IMILO'}
            controls='liste-sessions-i-milo-a-clore'
            onSelectTab={() => switchTab('SESSIONS_IMILO')}
            iconName={IconName.EventFill}
          />
        )}
        <Tab
          label='Archivage des comptes'
          selected={currentTab === 'ARCHIVAGE'}
          controls='liste-beneficiaires-a-archiver'
          onSelectTab={() => switchTab('ARCHIVAGE')}
          iconName={IconName.Delete}
          important={true}
        />
      </TabList>

      {currentTab === 'ACTIONS' && (
        <div
          role='tabpanel'
          aria-labelledby='liste-actions-à-qualifier--tab'
          tabIndex={0}
          id='liste-actions-à-qualifier'
          className='mt-6 pb-8 border-b border-primary-lighten'
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

      {currentTab === 'RDVS_ET_AC' && (
        <div
          role='tabpanel'
          aria-labelledby='liste-rdvs-et-ac-a-clore--tab'
          tabIndex={0}
          id='liste-rdvs-et-ac-a-clore'
          className='mt-8 pb-8 border-b border-primary-lighten'
        >
          {!animationsCollectivesAffichees && (
            <EncartMissionLocaleRequise
              onMissionLocaleChoisie={renseignerMissionLocale}
              getMissionsLocales={getMissionsLocalesClientSide}
              onChangeAffichageModal={trackAgenceModal}
            />
          )}

          {animationsCollectivesAffichees && (
            <OngletRdvsEtAnimationsCollectivesPilotage
              rdvsEtAnimationsCollectivesInitiaux={
                animationsCollectivesAffichees?.donnees
              }
              metadonneesInitiales={animationsCollectivesAffichees?.metadonnees}
              getRdvsEtAnimationsCollectives={chargerRdvsEtAC}
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
            className='mt-8 pb-8 border-b border-primary-lighten'
          >
            {sessions && <OngletSessionsImiloPilotage sessions={sessions} />}
          </div>
        )}

      {currentTab === 'ARCHIVAGE' && (
        <div
          role='tabpanel'
          aria-labelledby='liste-beneficiaires-a-archiver--tab'
          tabIndex={0}
          id='liste-beneficiaires-a-archiver'
          className='mt-8 pb-8 border-b border-primary-lighten'
        >
          <OngletBeneficiairesAArchiverPilotage
            beneficiaires={beneficiairesAArchiver}
          />
        </div>
      )}
    </>
  )
}

export default withTransaction(PilotagePage.name, 'page')(PilotagePage)
