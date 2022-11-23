import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { OngletAgendaConseiller } from 'components/rdv/OngletAgendaConseiller'
import { OngletAgendaEtablissement } from 'components/rdv/OngletAgendaEtablissement'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { StructureConseiller } from 'interfaces/conseiller'
import { AnimationCollective, EvenementListItem } from 'interfaces/evenement'
import { PageProps } from 'interfaces/pageProps'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { EvenementsService } from 'services/evenements.service'
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
  creationSuccess?: boolean
  modificationSuccess?: boolean
  suppressionSuccess?: boolean
  messageEnvoiGroupeSuccess?: boolean
}
function Agenda({
  onglet,
  creationSuccess,
  modificationSuccess,
  suppressionSuccess,
  messageEnvoiGroupeSuccess,
}: AgendaProps) {
  const rendezVousService =
    useDependance<EvenementsService>('evenementsService')
  const [conseiller] = useConseiller()
  const router = useRouter()

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
  if (creationSuccess) initialTracking += ' - Creation rdv succès'
  if (modificationSuccess) initialTracking += ' - Modification rdv succès'
  if (suppressionSuccess) initialTracking += ' - Suppression rdv succès'
  if (messageEnvoiGroupeSuccess) initialTracking += ' - Succès envoi message'
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
      <ButtonLink href='/mes-jeunes/edition-rdv' className='mb-10 w-fit'>
        <IconComponent
          name={IconName.Add}
          focusable={false}
          aria-hidden={true}
          className='mr-2 w-4 h-4'
        />
        Créer un événement
      </ButtonLink>

      <TabList className='mb-6'>
        <Tab
          label='Mon agenda'
          selected={currentTab === Onglet.CONSEILLER}
          controls='agenda-conseiller'
          onSelectTab={() => switchTab(Onglet.CONSEILLER)}
          iconName={IconName.Calendar}
        />
        {conseiller?.agence?.id && (
          <Tab
            label='Agenda établissement'
            selected={currentTab === Onglet.ETABLISSEMENT}
            controls='agenda-etablissement'
            onSelectTab={() => switchTab(Onglet.ETABLISSEMENT)}
            iconName={IconName.Calendar}
          />
        )}
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
          <OngletAgendaEtablissement
            idEtablissement={conseiller?.agence?.id}
            recupererAnimationsCollectives={recupererRdvsEtablissement}
            trackNavigation={trackNavigation}
          />
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

  if (
    context.query[QueryParam.creationRdv] ||
    context.query[QueryParam.creationAC]
  )
    props.creationSuccess =
      context.query[QueryParam.creationRdv] === QueryValue.succes ||
      context.query[QueryParam.creationAC] === QueryValue.succes

  if (
    context.query[QueryParam.modificationRdv] ||
    context.query[QueryParam.modificationAC]
  )
    props.modificationSuccess =
      context.query[QueryParam.modificationRdv] === QueryValue.succes ||
      context.query[QueryParam.modificationAC] === QueryValue.succes

  if (
    context.query[QueryParam.suppressionRdv] ||
    context.query[QueryParam.suppressionAC]
  )
    props.suppressionSuccess =
      context.query[QueryParam.suppressionRdv] === QueryValue.succes ||
      context.query[QueryParam.suppressionAC] === QueryValue.succes

  if (context.query[QueryParam.envoiMessage]) {
    props.messageEnvoiGroupeSuccess =
      context.query[QueryParam.envoiMessage] === QueryValue.succes
  }
  return { props }
}

export default withTransaction(Agenda.name, 'page')(Agenda)
