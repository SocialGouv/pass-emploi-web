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
import { PageProps } from 'interfaces/pageProps'
import { AnimationCollective, RdvListItem } from 'interfaces/rdv'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { RendezVousService } from 'services/rendez-vous.service'
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
    useDependance<RendezVousService>('rendezVousService')
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
  ): Promise<RdvListItem[]> {
    return rendezVousService.getRendezVousConseiller(
      idConseiller,
      dateDebut,
      dateFin
    )
  }

  function recupererRdvsEtablissement(
    idEtablissement: string
  ): Promise<AnimationCollective[]> {
    return rendezVousService.getRendezVousEtablissement(idEtablissement)
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

  if (context.query[QueryParam.creationRdv])
    props.creationSuccess =
      context.query[QueryParam.creationRdv] === QueryValue.succes

  if (context.query[QueryParam.modificationRdv])
    props.modificationSuccess =
      context.query[QueryParam.modificationRdv] === QueryValue.succes

  if (context.query[QueryParam.suppressionRdv])
    props.suppressionSuccess =
      context.query[QueryParam.suppressionRdv] === QueryValue.succes

  if (context.query[QueryParam.envoiMessage]) {
    props.messageEnvoiGroupeSuccess =
      context.query[QueryParam.envoiMessage] === QueryValue.succes
  }
  return { props }
}

export default withTransaction(Agenda.name, 'page')(Agenda)
