import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import EncartAgenceRequise from 'components/EncartAgenceRequise'
import PageActionsPortal from 'components/PageActionsPortal'
import { OngletAgendaConseiller } from 'components/rdv/OngletAgendaConseiller'
import { OngletAgendaEtablissement } from 'components/rdv/OngletAgendaEtablissement'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { StructureConseiller } from 'interfaces/conseiller'
import { AnimationCollective, EvenementListItem } from 'interfaces/evenement'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { ConseillerService } from 'services/conseiller.service'
import { EvenementsService } from 'services/evenements.service'
import { ReferentielService } from 'services/referentiel.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'

enum Onglet {
  CONSEILLER = 'CONSEILLER',
  ETABLISSEMENT = 'ETABLISSEMENT',
}

interface AgendaProps extends PageProps {
  pageTitle: string
  onglet?: Onglet
}

function Agenda({ onglet }: AgendaProps) {
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')
  const rendezVousService =
    useDependance<EvenementsService>('evenementsService')
  const referentielService =
    useDependance<ReferentielService>('referentielService')

  const [conseiller, setConseiller] = useConseiller()

  const router = useRouter()
  const [alerte] = useAlerte()

  const ongletProps: {
    [key in Onglet]: { queryParam: string; trackingLabel: string }
  } = {
    CONSEILLER: { queryParam: 'conseiller', trackingLabel: 'conseiller' },
    ETABLISSEMENT: {
      queryParam: 'etablissement',
      trackingLabel: 'établissement',
    },
  }
  const [currentTab, setCurrentTab] = useState<Onglet>(
    onglet ?? Onglet.CONSEILLER
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

  async function switchTab(tab: Onglet) {
    setCurrentTab(tab)

    setTrackingTitle(trackingLabelOnglet(tab))
    await router.replace(
      {
        pathname: '/agenda',
        query: { onglet: ongletProps[tab].queryParam },
      },
      undefined,
      {
        shallow: true,
      }
    )
  }

  function recupererRdvsConseiller(
    idConseiller: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<EvenementListItem[]> {
    return rendezVousService.getRendezVousConseiller(
      idConseiller,
      dateDebut,
      dateFin
    )
  }

  function recupererRdvsEtablissement(
    idEtablissement: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<AnimationCollective[]> {
    return rendezVousService.getRendezVousEtablissement(
      idEtablissement,
      dateDebut,
      dateFin
    )
  }

  async function trackAgenceModal(trackingMessage: string) {
    setTrackingTitle(initialTracking + ' - ' + trackingMessage)
  }

  async function renseignerAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    await conseillerService.modifierAgence(agence)
    setConseiller({ ...conseiller!, agence })
    setTrackingTitle(initialTracking + ' - Succès ajout agence')
  }

  function trackNavigation(append?: string) {
    const trackingOnglet = trackingLabelOnglet(currentTab)
    setTrackingTitle(trackingOnglet + (append ? ` - ${append}` : ''))
  }

  function trackingLabelOnglet(tab: Onglet): string {
    return initialTracking + ' ' + ongletProps[tab].trackingLabel
  }

  useMatomo(trackingTitle)

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

        {conseiller && conseiller.agence && (
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
          label='Mon agenda'
          selected={currentTab === Onglet.CONSEILLER}
          controls='agenda-conseiller'
          onSelectTab={() => switchTab(Onglet.CONSEILLER)}
          iconName={IconName.Calendar}
        />

        <Tab
          label='Agenda établissement'
          selected={currentTab === Onglet.ETABLISSEMENT}
          controls='agenda-etablissement'
          onSelectTab={() => switchTab(Onglet.ETABLISSEMENT)}
          iconName={IconName.Calendar}
        />
      </TabList>

      {currentTab === Onglet.CONSEILLER && (
        <div
          role='tabpanel'
          aria-labelledby='agenda-conseiller--tab'
          tabIndex={0}
          id='agenda-conseiller'
        >
          <OngletAgendaConseiller
            idConseiller={conseiller?.id}
            recupererRdvs={recupererRdvsConseiller}
            trackNavigation={trackNavigation}
          />
        </div>
      )}

      {currentTab === Onglet.ETABLISSEMENT && (
        <div
          role='tabpanel'
          aria-labelledby='agenda-etablissement--tab'
          tabIndex={0}
          id='agenda-etablissement'
        >
          {conseiller && conseiller.agence && (
            <OngletAgendaEtablissement
              idEtablissement={conseiller?.agence?.id}
              recupererAnimationsCollectives={recupererRdvsEtablissement}
              trackNavigation={trackNavigation}
            />
          )}

          {conseiller && !conseiller.agence && (
            <EncartAgenceRequise
              structureConseiller={conseiller.structure}
              onAgenceChoisie={renseignerAgence}
              getAgences={referentielService.getAgencesClientSide.bind(
                referentielService
              )}
              onChangeAffichageModal={trackAgenceModal}
            />
          )}
        </div>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<AgendaProps> = async (
  context
): Promise<GetServerSidePropsResult<AgendaProps>> => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user },
  } = sessionOrRedirect
  if (user.structure === StructureConseiller.POLE_EMPLOI) {
    return { notFound: true }
  }

  const props: AgendaProps = {
    pageTitle: 'Tableau de bord - Agenda',
    pageHeader: 'Agenda',
  }

  if (context.query.onglet)
    props.onglet =
      context.query.onglet === 'etablissement'
        ? Onglet.ETABLISSEMENT
        : Onglet.CONSEILLER

  return { props }
}

export default withTransaction(Agenda.name, 'page')(Agenda)
