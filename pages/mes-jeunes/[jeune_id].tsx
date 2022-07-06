import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import DeleteJeuneModal from '../../components/jeune/DeleteJeuneModal'
import { SuppressionJeuneFormData } from '../../interfaces/json/jeune'

import { OngletActions } from 'components/action/OngletActions'
import FailureMessage from 'components/FailureMessage'
import InformationMessage from 'components/InformationMessage'
import { CollapseButton } from 'components/jeune/CollapseButton'
import { DetailsJeune } from 'components/jeune/DetailsJeune'
import { ListeConseillersJeune } from 'components/jeune/ListeConseillersJeune'
import { OngletRdvs } from 'components/rdv/OngletRdvs'
import Button, { ButtonStyle } from 'components/ui/Button'
import ButtonLink from 'components/ui/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import SuccessMessage from 'components/ui/SuccessMessage'
import Tab from 'components/ui/Tab'
import TabList from 'components/ui/TabList'
import { Action, MetadonneesActions, StatutAction } from 'interfaces/action'
import { UserStructure } from 'interfaces/conseiller'
import {
  ConseillerHistorique,
  DetailJeune,
  MotifsSuppression,
} from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { RdvListItem, rdvToListItem } from 'interfaces/rdv'
import { QueryParams, QueryValues } from 'referentiel/queryParams'
import { ActionsService } from 'services/actions.service'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useCurrentJeune } from 'utils/chat/currentJeuneContext'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

export enum Onglet {
  RDVS = 'RDVS',
  ACTIONS = 'ACTIONS',
}

const ongletProps: { [key in Onglet]: string } = {
  RDVS: 'rdvs',
  ACTIONS: 'actions',
}

interface FicheJeuneProps extends PageProps {
  jeune: DetailJeune
  rdvs: RdvListItem[]
  actionsInitiales: {
    actions: Action[]
    metadonnees: MetadonneesActions
    page: number
  }
  conseillers: ConseillerHistorique[]
  rdvCreationSuccess?: boolean
  rdvModificationSuccess?: boolean
  rdvSuppressionSuccess?: boolean
  actionCreationSuccess?: boolean
  messageEnvoiGroupeSuccess?: boolean
  onglet?: Onglet
  motifsSuppression: MotifsSuppression[]
}

function FicheJeune({
  jeune,
  rdvs,
  actionsInitiales,
  conseillers,
  rdvCreationSuccess,
  rdvModificationSuccess,
  rdvSuppressionSuccess,
  actionCreationSuccess,
  messageEnvoiGroupeSuccess,
  onglet,
  motifsSuppression,
}: FicheJeuneProps) {
  const { data: session } = useSession<true>({ required: true })

  const actionsService = useDependance<ActionsService>('actionsService')
  const jeunesServices = useDependance<JeunesService>('jeunesService')
  const router = useRouter()
  const [, setIdCurrentJeune] = useCurrentJeune()

  const listeConseillersReduite = conseillers.slice(0, 5)
  const [conseillersAffiches, setConseillersAffiches] = useState<
    ConseillerHistorique[]
  >(listeConseillersReduite)
  const [expandListeConseillers, setExpandListeConseillers] =
    useState<boolean>(false)

  const [currentTab, setCurrentTab] = useState<Onglet>(onglet ?? Onglet.RDVS)
  const [totalActions, setTotalActions] = useState<number>(
    actionsInitiales.metadonnees.nombreTotal
  )

  const [showDeleteJeuneModal, setShowDeleteJeuneModal] =
    useState<boolean>(false)

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

  async function switchTab(tab: Onglet) {
    setCurrentTab(tab)
    const tabLabel = tab === Onglet.ACTIONS ? 'Actions' : 'Événements'
    setTrackingLabel(pageTracking + ' - Consultation ' + tabLabel)
    await router.replace(
      {
        pathname: `/mes-jeunes/${jeune.id}`,
        query: { onglet: ongletProps[tab] },
      },
      undefined,
      {
        shallow: true,
      }
    )
  }

  async function chargerActions(
    page: number,
    statuts: StatutAction[]
  ): Promise<{ actions: Action[]; metadonnees: MetadonneesActions }> {
    const result = await actionsService.getActionsJeune(
      jeune.id,
      { page, statuts },
      session!.accessToken
    )

    setTotalActions(result.metadonnees.nombreTotal)
    return result
  }

  function handleDelete(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault()
    e.stopPropagation()
    openDeleteJeuneModal()
  }

  function openDeleteJeuneModal() {
    setShowDeleteJeuneModal(true)
  }
  function closeDeleteJeuneModal() {
    setShowDeleteJeuneModal(false)
  }

  useMatomo(trackingLabel)

  useEffect(() => {
    setIdCurrentJeune(jeune.id)
  }, [jeune, setIdCurrentJeune])

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
            'Votre message multi-destinataires a été envoyé en tant que message individuel à chacun des bénéficiaires'
          }
          onAcknowledge={closeMessage}
        />
      )}

      {showDeleteJeuneModal && (
        <DeleteJeuneModal
          jeune={jeune}
          onClose={closeDeleteJeuneModal}
          motifsSuppression={motifsSuppression}
          submitDelete={archiverJeuneCompteActif}
        />
      )}

      {!jeune.isActivated && (
        <FailureMessage label='Ce bénéficiaire ne s’est pas encore connecté à l’application' />
      )}

      {jeune.isReaffectationTemporaire && (
        <div className='mb-6'>
          <InformationMessage
            iconName={IconName.Clock}
            content='Ce bénéficiaire a été ajouté temporairement à votre portefeuille en attendant le retour de son conseiller initial.'
          />
        </div>
      )}

      <div className='flex justify-between'>
        <div className='flex'>
          {!isPoleEmploi && (
            <ButtonLink href={`/mes-jeunes/edition-rdv`} className='mb-4'>
              Fixer un rendez-vous
            </ButtonLink>
          )}

          {!isPoleEmploi && (
            <ButtonLink
              href={`/mes-jeunes/${jeune.id}/actions/nouvelle-action`}
              className='mb-4 ml-4'
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
        </div>

        <Button
          onClick={handleDelete}
          style={ButtonStyle.SECONDARY}
          className='w-fit'
        >
          Supprimer ce compte
        </Button>
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
        <div className='flex justify-start mt-8'>
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
          count={!isPoleEmploi ? totalActions : undefined}
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
          className='mt-8 pb-8 border-b border-primary_lighten'
        >
          <OngletRdvs
            poleEmploi={isPoleEmploi}
            rdvs={rdvs}
            idConseiller={session?.user.id ?? ''}
          />
        </div>
      )}
      {currentTab === Onglet.ACTIONS && (
        <div
          role='tabpanel'
          aria-labelledby='liste-actions--tab'
          tabIndex={0}
          id='liste-actions'
          className='mt-8 pb-8'
        >
          <OngletActions
            poleEmploi={isPoleEmploi}
            jeune={jeune}
            actionsInitiales={actionsInitiales}
            getActions={chargerActions}
          />
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
  const page = parseInt(context.query.page as string, 10) || 1
  const [jeune, conseillers, rdvs, actions, motifsSuppression] =
    await Promise.all([
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
        ? { actions: [], metadonnees: { nombreTotal: 0, nombrePages: 0 } }
        : actionsService.getActionsJeune(
            context.query.jeune_id as string,
            { page, statuts: [] },
            accessToken
          ),
      jeunesService.getMotifsSuppression(accessToken),
    ])

  if (!jeune) {
    return { notFound: true }
  }

  const now = new Date()
  const props: FicheJeuneProps = {
    jeune,
    rdvs: rdvs.filter((rdv) => new Date(rdv.date) > now).map(rdvToListItem),
    actionsInitiales: { ...actions, page },
    conseillers,
    pageTitle: `Mes jeunes - ${jeune.prenom} ${jeune.nom}`,
    pageHeader: `${jeune.prenom} ${jeune.nom}`,
    motifsSuppression,
  }

  if (context.query[QueryParams.creationRdv])
    props.rdvCreationSuccess =
      context.query[QueryParams.creationRdv] === QueryValues.succes

  if (context.query[QueryParams.modificationRdv])
    props.rdvModificationSuccess =
      context.query[QueryParams.modificationRdv] === QueryValues.succes

  if (context.query[QueryParams.suppressionRdv])
    props.rdvSuppressionSuccess =
      context.query[QueryParams.suppressionRdv] === QueryValues.succes

  if (context.query[QueryParams.creationAction])
    props.actionCreationSuccess =
      context.query[QueryParams.creationAction] === QueryValues.succes

  if (context.query[QueryParams.envoiMessage])
    props.messageEnvoiGroupeSuccess =
      context.query[QueryParams.envoiMessage] === QueryValues.succes

  if (context.query.onglet) {
    props.onglet =
      context.query.onglet === 'actions' ? Onglet.ACTIONS : Onglet.RDVS
  }

  return {
    props,
  }
}

export default withTransaction(FicheJeune.name, 'page')(FicheJeune)
