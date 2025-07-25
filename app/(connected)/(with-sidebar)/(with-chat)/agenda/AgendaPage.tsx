'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import EncartMissionLocaleRequise from 'components/EncartMissionLocaleRequise'
import PageActionsPortal from 'components/PageActionsPortal'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { peutAccederAuxSessions } from 'interfaces/conseiller'
import { AnimationCollective, EvenementListItem } from 'interfaces/evenement'
import { MissionLocale } from 'interfaces/referentiel'
import { AlerteParam } from 'referentiel/alerteParam'
import { getMissionsLocalesClientSide } from 'services/referentiel.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

const OngletAgendaConseiller = dynamic(
  () => import('components/rdv/OngletAgendaConseiller')
)
const OngletAgendaMissionLocale = dynamic(
  () => import('components/rdv/OngletAgendaMissionLocale')
)

type Onglet = 'CONSEILLER' | 'MISSION_LOCALE'
type AgendaPageProps = {
  onglet: Onglet
  debutPeriodeInitiale?: string
}

function AgendaPage({ onglet, debutPeriodeInitiale }: AgendaPageProps) {
  const [conseiller, setConseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()

  const router = useRouter()
  const [alerte] = useAlerte()

  const ongletProps: {
    [key in Onglet]: { queryParam: string; trackingLabel: string }
  } = {
    CONSEILLER: { queryParam: 'conseiller', trackingLabel: 'conseiller' },
    MISSION_LOCALE: {
      queryParam: 'mission-locale',
      trackingLabel: 'Mission Locale',
    },
  }
  const [currentTab, setCurrentTab] = useState<Onglet>(onglet)
  const [debutPeriode, setDebutPeriode] = useState<DateTime>(
    debutPeriodeInitiale
      ? DateTime.fromISO(debutPeriodeInitiale)
      : DateTime.now()
  )

  let initialTracking = `Agenda`
  if (alerte?.key === AlerteParam.creationRDV)
    initialTracking += ' - Creation rdv succès'
  if (alerte?.key === AlerteParam.modificationRDV)
    initialTracking += ' - Modification rdv succès'
  if (alerte?.key === AlerteParam.suppressionRDV)
    initialTracking += ' - Suppression rdv succès'
  if (alerte?.key === AlerteParam.creationAnimationCollective)
    initialTracking += ' - Creation animation collective succès'
  if (alerte?.key === AlerteParam.modificationAnimationCollective)
    initialTracking += ' - Modification animation collective succès'
  if (alerte?.key === AlerteParam.suppressionAnimationCollective)
    initialTracking += ' - Suppression animation collective succès'
  if (alerte?.key === AlerteParam.envoiMessage)
    initialTracking += ' - Succès envoi message'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  async function updateTabInUrl(tab: Onglet) {
    setCurrentTab(tab)
    setTrackingTitle(getTrackingLabelOnglet(tab))
    router.replace(
      `/agenda?onglet=${ongletProps[tab].queryParam}&debut=${debutPeriode.toISODate()}`,
      { scroll: false }
    )
  }

  async function updatePeriodeInUrl(nouveauDebut: DateTime) {
    setDebutPeriode(nouveauDebut)
    router.replace(
      `/agenda?onglet=${ongletProps[currentTab].queryParam}&debut=${nouveauDebut.toISODate()}`,
      { scroll: false }
    )
  }

  async function recupererRdvsConseiller(
    idConseiller: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<EvenementListItem[]> {
    const { getRendezVousConseiller } = await import(
      'services/evenements.service'
    )
    return getRendezVousConseiller(idConseiller, dateDebut, dateFin)
  }

  async function recupererSessionsBeneficiaires(
    idConseiller: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<EvenementListItem[]> {
    const { getSessionsBeneficiaires } = await import(
      'services/sessions.service'
    )
    return getSessionsBeneficiaires(idConseiller, dateDebut, dateFin)
  }

  async function recupererRdvsEtablissement(
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<AnimationCollective[]> {
    const { getRendezVousEtablissement } = await import(
      'services/evenements.service'
    )
    return getRendezVousEtablissement(
      conseiller.agence!.id!,
      dateDebut,
      dateFin
    )
  }

  async function recupererSessionsMissionLocale(
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<AnimationCollective[]> {
    if (!peutAccederAuxSessions(conseiller)) return []

    const { getSessionsMissionLocaleClientSide } = await import(
      'services/sessions.service'
    )
    return getSessionsMissionLocaleClientSide(conseiller.id, dateDebut, dateFin)
  }

  async function trackAgenceModal(trackingMessage: string) {
    setTrackingTitle(initialTracking + ' - ' + trackingMessage)
  }

  async function renseignerMissionLocale(
    missionLocale: MissionLocale
  ): Promise<void> {
    const { modifierAgence } = await import('services/conseiller.service')
    await modifierAgence(missionLocale)
    setConseiller({
      ...conseiller,
      agence: missionLocale,
      structureMilo: missionLocale,
    })
    setTrackingTitle(initialTracking + ' - Succès ajout agence')
  }

  function trackNavigation(append?: string) {
    const trackingOnglet = getTrackingLabelOnglet(currentTab)
    setTrackingTitle(trackingOnglet + (append ? ` - ${append}` : ''))
  }

  function getTrackingLabelOnglet(tab: Onglet): string {
    return initialTracking + ' ' + ongletProps[tab].trackingLabel
  }

  useMatomo(trackingTitle, portefeuille.length > 0)

  return (
    <>
      <PageActionsPortal>
        <ButtonLink href='/mes-jeunes/edition-rdv'>
          <IconComponent
            name={IconName.Add}
            focusable={false}
            aria-hidden={true}
            className='mr-2 w-4 h-4'
          />
          Créer un rendez-vous
        </ButtonLink>

        {conseiller.agence && (
          <ButtonLink href='/mes-jeunes/edition-rdv?type=ac'>
            <IconComponent
              name={IconName.Add}
              focusable={false}
              aria-hidden={true}
              className='mr-2 w-4 h-4'
            />
            Créer une animation collective
          </ButtonLink>
        )}
      </PageActionsPortal>

      <TabList label='Vos agendas' className='mb-6'>
        <Tab
          label='Agenda Mission Locale'
          selected={currentTab === 'MISSION_LOCALE'}
          controls='agenda-mission-locale'
          onSelectTab={() => updateTabInUrl('MISSION_LOCALE')}
          iconName={IconName.EventFill}
        />
        <Tab
          label='Mon agenda'
          selected={currentTab === 'CONSEILLER'}
          controls='agenda-conseiller'
          onSelectTab={() => updateTabInUrl('CONSEILLER')}
          iconName={IconName.EventFill}
        />
      </TabList>

      {currentTab === 'MISSION_LOCALE' && (
        <div
          role='tabpanel'
          aria-labelledby='agenda-mission-locale--tab'
          tabIndex={0}
          id='agenda-mission-locale'
        >
          {conseiller.agence && (
            <OngletAgendaMissionLocale
              recupererAnimationsCollectives={recupererRdvsEtablissement}
              recupererSessionsMilo={recupererSessionsMissionLocale}
              trackNavigation={trackNavigation}
              debutPeriode={debutPeriode}
              changerPeriode={updatePeriodeInUrl}
            />
          )}

          {!conseiller.agence && (
            <EncartMissionLocaleRequise
              onMissionLocaleChoisie={renseignerMissionLocale}
              getMissionsLocales={getMissionsLocalesClientSide}
              onChangeAffichageModal={trackAgenceModal}
            />
          )}
        </div>
      )}

      {currentTab === 'CONSEILLER' && (
        <div
          role='tabpanel'
          aria-labelledby='agenda-conseiller--tab'
          tabIndex={0}
          id='agenda-conseiller'
        >
          <OngletAgendaConseiller
            conseiller={conseiller}
            recupererRdvs={recupererRdvsConseiller}
            recupererSessionsBeneficiaires={recupererSessionsBeneficiaires}
            trackNavigation={trackNavigation}
            debutPeriode={debutPeriode}
            changerPeriode={updatePeriodeInUrl}
          />
        </div>
      )}
    </>
  )
}

export default withTransaction(AgendaPage.name, 'page')(AgendaPage)
