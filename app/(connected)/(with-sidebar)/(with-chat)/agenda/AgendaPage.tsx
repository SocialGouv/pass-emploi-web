'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import EncartAgenceRequise from 'components/EncartAgenceRequise'
import PageActionsPortal from 'components/PageActionsPortal'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { estMilo, StructureConseiller } from 'interfaces/conseiller'
import { AnimationCollective, EvenementListItem } from 'interfaces/evenement'
import { AlerteParam } from 'referentiel/alerteParam'
import { getAgencesClientSide } from 'services/referentiel.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

const OngletAgendaConseiller = dynamic(
  () => import('components/rdv/OngletAgendaConseiller')
)
const OngletAgendaEtablissement = dynamic(
  () => import('components/rdv/OngletAgendaEtablissement')
)

type Onglet = 'CONSEILLER' | 'ETABLISSEMENT'
type AgendaPageProps = {
  onglet: Onglet
  periodeIndexInitial: number
}

function AgendaPage({ onglet, periodeIndexInitial }: AgendaPageProps) {
  const [conseiller, setConseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()

  const router = useRouter()
  const [alerte] = useAlerte()

  const ongletProps: {
    [key in Onglet]: { queryParam: string; trackingLabel: string }
  } = {
    CONSEILLER: { queryParam: 'conseiller', trackingLabel: 'conseiller' },
    ETABLISSEMENT: {
      queryParam: 'etablissement',
      trackingLabel: 'Mission Locale',
    },
  }
  const [currentTab, setCurrentTab] = useState<Onglet>(onglet)
  const [periodeIndex, setPeriodeIndex] = useState<number>(periodeIndexInitial)

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

  async function switchTab(tab: Onglet) {
    setCurrentTab(tab)
    setTrackingTitle(trackingLabelOnglet(tab))
    router.replace(
      `/agenda?onglet=${ongletProps[tab].queryParam}&periodeIndex=${periodeIndex}`
    )
  }

  async function switchPeriode(index: number) {
    setPeriodeIndex(index)
    router.replace(
      `/agenda?onglet=${ongletProps[currentTab].queryParam}&periodeIndex=${index}`
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
    if (conseiller.structure !== StructureConseiller.MILO) return []

    const { getSessionsMissionLocaleClientSide } = await import(
      'services/sessions.service'
    )
    return getSessionsMissionLocaleClientSide(conseiller.id, dateDebut, dateFin)
  }

  async function trackAgenceModal(trackingMessage: string) {
    setTrackingTitle(initialTracking + ' - ' + trackingMessage)
  }

  async function renseignerAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    const { modifierAgence } = await import('services/conseiller.service')
    await modifierAgence(agence)
    setConseiller({ ...conseiller, agence })
    setTrackingTitle(initialTracking + ' - Succès ajout agence')
  }

  function trackNavigation(append?: string) {
    const trackingOnglet = trackingLabelOnglet(currentTab)
    setTrackingTitle(trackingOnglet + (append ? ` - ${append}` : ''))
  }

  function trackingLabelOnglet(tab: Onglet): string {
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

      <TabList className='mb-6'>
        <Tab
          label={
            'Agenda ' +
            (estMilo(conseiller) ? 'Mission Locale' : 'établissement')
          }
          selected={currentTab === 'ETABLISSEMENT'}
          controls='agenda-etablissement'
          onSelectTab={() => switchTab('ETABLISSEMENT')}
          iconName={IconName.EventFill}
        />
        <Tab
          label='Mon agenda'
          selected={currentTab === 'CONSEILLER'}
          controls='agenda-conseiller'
          onSelectTab={() => switchTab('CONSEILLER')}
          iconName={IconName.EventFill}
        />
      </TabList>

      {currentTab === 'ETABLISSEMENT' && (
        <div
          role='tabpanel'
          aria-labelledby='agenda-etablissement--tab'
          tabIndex={0}
          id='agenda-etablissement'
        >
          {conseiller.agence && (
            <OngletAgendaEtablissement
              recupererAnimationsCollectives={recupererRdvsEtablissement}
              recupererSessionsMilo={recupererSessionsMissionLocale}
              trackNavigation={trackNavigation}
              periodeIndex={periodeIndex}
              changerPeriode={switchPeriode}
              setTrackingTitle={setTrackingTitle}
              initialTracking={initialTracking}
            />
          )}

          {!conseiller.agence && (
            <EncartAgenceRequise
              conseiller={conseiller}
              onAgenceChoisie={renseignerAgence}
              getAgences={getAgencesClientSide}
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
            periodeIndex={periodeIndex}
            changerPeriode={switchPeriode}
          />
        </div>
      )}
    </>
  )
}

export default withTransaction(AgendaPage.name, 'page')(AgendaPage)
