import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import { TableauActionsJeune } from 'components/action/TableauActionsJeune'
import { CollapseButton } from 'components/jeune/CollapseButton'
import { DetailsJeune } from 'components/jeune/DetailsJeune'
import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import { ListeConseillersJeune } from 'components/jeune/ListeConseillersJeune'
import RdvList from 'components/rdv/RdvList'
import { ButtonStyle } from 'components/ui/Button'
import ButtonLink from 'components/ui/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import SuccessMessage from 'components/ui/SuccessMessage'
import Tab from 'components/ui/Tab'
import TabList from 'components/ui/TabList'
import { Action, compareActionsDatesDesc } from 'interfaces/action'
import { UserStructure } from 'interfaces/conseiller'
import { ConseillerHistorique, Jeune } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { RdvListItem, rdvToListItem } from 'interfaces/rdv'
import { ActionsService } from 'services/actions.service'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useCurrentJeune } from 'utils/chat/currentJeuneContext'
import withDependance from 'utils/injectionDependances/withDependance'

interface FicheJeuneProps extends PageProps {
  jeune: Jeune
  rdvs: RdvListItem[]
  actions: Action[]
  conseillers: ConseillerHistorique[]
  rdvCreationSuccess?: boolean
  rdvModificationSuccess?: boolean
  rdvSuppressionSuccess?: boolean
  actionCreationSuccess?: boolean
  messageEnvoiGroupeSuccess?: boolean
}

function FicheJeune({
  jeune,
  rdvs,
  actions,
  conseillers,
  rdvCreationSuccess,
  rdvModificationSuccess,
  rdvSuppressionSuccess,
  actionCreationSuccess,
  messageEnvoiGroupeSuccess,
}: FicheJeuneProps) {
  const { data: session } = useSession<true>({ required: true })
  const router = useRouter()
  const [, setCurrentJeune] = useCurrentJeune()

  const listeConseillersReduite = conseillers.slice(0, 5)
  const [conseillersAffiches, setConseillersAffiches] = useState<
    ConseillerHistorique[]
  >(listeConseillersReduite)
  const [expandListeConseillers, setExpandListeConseillers] =
    useState<boolean>(false)

  enum Onglet {
    RDVS = 'RDVS',
    ACTIONS = 'ACTIONS',
  }

  const [currentTab, setCurrentTab] = useState<Onglet>(Onglet.RDVS)

  const [showRdvCreationSuccess, setShowRdvCreationSuccess] = useState<boolean>(
    rdvCreationSuccess ?? false
  )
  const [showRdvModificationSuccess, setShowRdvModificationSuccess] =
    useState<boolean>(rdvModificationSuccess ?? false)

  const [showRdvSuppressionSuccess, setShowRdvSuppressionSuccess] =
    useState<boolean>(rdvSuppressionSuccess ?? false)

  const [showActionCreationSuccess, setShowActionCreationSuccess] =
    useState<boolean>(actionCreationSuccess ?? false)

  const [showMessageGroupeEnvoiSuccess, setShowMessageGroupeEnvoiSuccess] =
    useState<boolean>(messageEnvoiGroupeSuccess ?? false)

  const pageTracking: string = jeune.isActivated
    ? 'Détail jeune'
    : 'Détail jeune - Non Activé'
  let initialTracking = pageTracking
  if (rdvCreationSuccess) initialTracking += ' - Creation rdv succès'
  if (rdvModificationSuccess) initialTracking += ' - Modification rdv succès'
  if (rdvSuppressionSuccess) initialTracking += ' - Suppression rdv succès'
  if (actionCreationSuccess) initialTracking += ' - Succès creation action'
  if (messageEnvoiGroupeSuccess) initialTracking += ' - Succès envoi message'
  const [trackingLabel, setTrackingLabel] = useState<string>(initialTracking)

  const isPoleEmploi = session?.user.structure === UserStructure.POLE_EMPLOI

  async function closeMessage() {
    setShowRdvCreationSuccess(false)
    setShowRdvModificationSuccess(false)
    setShowRdvSuppressionSuccess(false)
    setShowActionCreationSuccess(false)
    setShowMessageGroupeEnvoiSuccess(false)
    await router.replace({ pathname: `/mes-jeunes/${jeune.id}` }, undefined, {
      shallow: true,
    })
  }

  function toggleListeConseillers(): void {
    setExpandListeConseillers(!expandListeConseillers)
    if (!expandListeConseillers) {
      setConseillersAffiches(conseillers)
    } else {
      setConseillersAffiches(listeConseillersReduite)
    }
  }

  function trackDossierMiloClick() {
    setTrackingLabel(pageTracking + ' - Dossier i-Milo')
  }

  function switchTab(tab: Onglet): void {
    setCurrentTab(tab)
    const tabLabel = tab === Onglet.ACTIONS ? 'Actions' : 'Événements'
    setTrackingLabel(pageTracking + ' - Consultation ' + tabLabel)
  }

  useMatomo(trackingLabel)

  useEffect(() => {
    setCurrentJeune(jeune)
  }, [jeune, setCurrentJeune])

  return (
    <>
      {showRdvCreationSuccess && (
        <SuccessMessage
          label={'Le rendez-vous a bien été créé'}
          onAcknowledge={closeMessage}
        />
      )}

      {showRdvModificationSuccess && (
        <SuccessMessage
          label={'Le rendez-vous a bien été modifié'}
          onAcknowledge={closeMessage}
        />
      )}

      {showRdvSuppressionSuccess && (
        <SuccessMessage
          label={'Le rendez-vous a bien été supprimé'}
          onAcknowledge={closeMessage}
        />
      )}

      {showActionCreationSuccess && (
        <SuccessMessage
          label={'L’action a bien été créée'}
          onAcknowledge={closeMessage}
        />
      )}

      {showMessageGroupeEnvoiSuccess && (
        <SuccessMessage
          label={
            'Votre message multi-destinataires a été envoyé en tant que message individuel à chacun des jeunes'
          }
          onAcknowledge={closeMessage}
        />
      )}

      {!jeune.isActivated && (
        <p className='mb-6 bg-warning_lighten py-4 px-7 rounded-medium max-w-md text-center'>
          <span className='text-sm-semi text-warning'>
            Ce jeune ne s&apos;est pas encore connect&eacute; &agrave;
            l&apos;application.
          </span>
        </p>
      )}
      <div className='flex'>
        {!isPoleEmploi && (
          <ButtonLink href={`/mes-jeunes/edition-rdv`} className='mb-4 w-fit'>
            Fixer un rendez-vous
          </ButtonLink>
        )}

        {!isPoleEmploi && (
          <ButtonLink
            href={`/mes-jeunes/${jeune.id}/actions/nouvelle-action`}
            className='mb-4 ml-8 w-fit'
          >
            <IconComponent
              name={IconName.Add}
              focusable='false'
              aria-hidden='true'
              className='mr-2 w-4 h-4'
            />
            Créer une nouvelle action
          </ButtonLink>
        )}

        {!jeune.isActivated && (
          <ButtonLink
            href={`/mes-jeunes/${jeune.id}/suppression`}
            style={ButtonStyle.WARNING}
            className='ml-8'
          >
            Supprimer ce compte
          </ButtonLink>
        )}
      </div>

      <DetailsJeune
        jeune={jeune}
        withSituations={session?.user.structure === UserStructure.MILO}
        onDossierMiloClick={trackDossierMiloClick}
      />

      <div className='mt-8'>
        <h2 className='text-base-medium mb-2'>Historique des conseillers</h2>
        <ListeConseillersJeune
          id='liste-conseillers'
          conseillers={conseillersAffiches}
        />
      </div>

      {conseillers.length > 5 && (
        <div className='flex justify-center mt-8'>
          <CollapseButton
            controlledId='liste-conseillers'
            isOpen={expandListeConseillers}
            onClick={toggleListeConseillers}
          />
        </div>
      )}

      <TabList className='mt-10'>
        <Tab
          label='Rendez-vous'
          count={!isPoleEmploi ? rdvs.length : undefined}
          selected={currentTab === Onglet.RDVS}
          controls='liste-rdvs'
          onSelectTab={() => switchTab(Onglet.RDVS)}
          iconName={IconName.Calendar}
        />
        <Tab
          label='Actions'
          count={!isPoleEmploi ? actions.length : undefined}
          selected={currentTab === Onglet.ACTIONS}
          controls='liste-actions'
          onSelectTab={() => switchTab(Onglet.ACTIONS)}
          iconName={IconName.Actions}
        />
      </TabList>

      {currentTab === Onglet.RDVS && (
        <div
          role='tabpanel'
          aria-labelledby='liste-rdvs--tab'
          tabIndex={0}
          id='liste-rdvs'
          className='mt-10 border-b border-primary_lighten'
        >
          {!isPoleEmploi ? (
            <RdvList
              rdvs={rdvs}
              idConseiller={session?.user.id ?? ''}
              withNameJeune={false}
            />
          ) : (
            <IntegrationPoleEmploi label='convocations' />
          )}
        </div>
      )}
      {currentTab === Onglet.ACTIONS && (
        <div
          role='tabpanel'
          aria-labelledby='liste-actions--tab'
          tabIndex={0}
          id='liste-actions'
          className='mt-8 border-b border-primary_lighten pb-8'
        >
          {isPoleEmploi && (
            <IntegrationPoleEmploi label='actions et démarches' />
          )}

          {!isPoleEmploi && (
            <TableauActionsJeune jeune={jeune} actions={actions} />
          )}
        </div>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<FicheJeuneProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const jeunesService = withDependance<JeunesService>('jeunesService')
  const rendezVousService =
    withDependance<RendezVousService>('rendezVousService')
  const actionsService = withDependance<ActionsService>('actionsService')
  const {
    session: {
      accessToken,
      user: { structure },
    },
  } = sessionOrRedirect

  const isPoleEmploi = structure === UserStructure.POLE_EMPLOI
  const [jeune, conseillers, rdvs, actions] = await Promise.all([
    jeunesService.getJeuneDetails(
      context.query.jeune_id as string,
      accessToken
    ),
    jeunesService.getConseillersDuJeune(
      context.query.jeune_id as string,
      accessToken
    ),
    isPoleEmploi
      ? []
      : rendezVousService.getRendezVousJeune(
          context.query.jeune_id as string,
          accessToken
        ),
    isPoleEmploi
      ? []
      : actionsService.getActionsJeune(
          context.query.jeune_id as string,
          accessToken
        ),
  ])

  if (!jeune) {
    return { notFound: true }
  }

  const now = new Date()
  const props: FicheJeuneProps = {
    jeune,
    rdvs: rdvs.filter((rdv) => new Date(rdv.date) > now).map(rdvToListItem),
    actions: [...actions].sort(compareActionsDatesDesc),
    conseillers,
    pageTitle: `Mes jeunes - ${jeune.firstName} ${jeune.lastName}`,
    pageHeader: `${jeune.firstName} ${jeune.lastName}`,
  }
  if (context.query.creationRdv)
    props.rdvCreationSuccess = context.query.creationRdv === 'succes'

  if (context.query.modificationRdv)
    props.rdvModificationSuccess = context.query.modificationRdv === 'succes'

  if (context.query.suppressionRdv)
    props.rdvSuppressionSuccess = context.query.suppressionRdv === 'succes'

  if (context.query.creationAction)
    props.actionCreationSuccess = context.query.creationAction === 'succes'

  if (context.query?.envoiMessage) {
    props.messageEnvoiGroupeSuccess = context.query?.envoiMessage === 'succes'
  }

  return {
    props,
  }
}

export default withTransaction(FicheJeune.name, 'page')(FicheJeune)
