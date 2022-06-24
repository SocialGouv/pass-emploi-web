import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { ReactNode, useEffect, useState } from 'react'

import { TableauActionsJeune } from 'components/action/TableauActionsJeune'
import FailureMessage from 'components/FailureMessage'
import InformationMessage from 'components/InformationMessage'
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
import { Action } from 'interfaces/action'
import { UserStructure } from 'interfaces/conseiller'
import { ConseillerHistorique, DetailJeune } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { RdvListItem, rdvToListItem } from 'interfaces/rdv'
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
  actionsInitiales: { actions: Action[]; total: number; page: number }
  conseillers: ConseillerHistorique[]
  rdvCreationSuccess?: boolean
  rdvModificationSuccess?: boolean
  rdvSuppressionSuccess?: boolean
  actionCreationSuccess?: boolean
  messageEnvoiGroupeSuccess?: boolean
  onglet?: Onglet
}

interface PaginationItemProps {
  page: number
  label: string
  onClick: (page: number) => Promise<void>
  children: ReactNode
  disabled?: boolean
  isActive?: boolean
}

function PaginationItem({
  children,
  label,
  onClick,
  page,
  disabled,
  isActive,
}: PaginationItemProps) {
  const isActiveStyle = isActive && 'bg-primary text-blanc'
  const hoverStyle =
    !disabled && !isActive && 'hover:bg-primary_lighten hover:text-primary'

  return (
    <li>
      <button
        onClick={() => onClick(page)}
        aria-label={label}
        aria-current={isActive && 'page'}
        title={label}
        disabled={disabled}
        className={`rounded-full px-3 py-1 fill-primary disabled:cursor-not-allowed disabled:fill-grey_700 disabled:text-grey_700 ${isActiveStyle} ${hoverStyle}`}
      >
        {children}
      </button>
    </li>
  )
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
}: FicheJeuneProps) {
  const { data: session } = useSession<true>({ required: true })

  const actionsService = useDependance<ActionsService>('actionsService')
  const router = useRouter()
  const [, setIdCurrentJeune] = useCurrentJeune()

  const listeConseillersReduite = conseillers.slice(0, 5)
  const [conseillersAffiches, setConseillersAffiches] = useState<
    ConseillerHistorique[]
  >(listeConseillersReduite)
  const [expandListeConseillers, setExpandListeConseillers] =
    useState<boolean>(false)

  const [currentTab, setCurrentTab] = useState<Onglet>(onglet ?? Onglet.RDVS)
  const [actionsDeLaPage, setActionsDeLaPage] = useState<Action[]>(
    actionsInitiales.actions
  )
  const [pageCourante, setPageCourante] = useState<number>(
    actionsInitiales.page
  )
  const pageCount = Math.ceil(actionsInitiales.total / 10)

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

  async function goToActionPage(page: number) {
    if (page < 1 || page > pageCount || page === pageCourante) return

    const { actions } = await actionsService.getActionsJeune(
      jeune.id,
      page,
      session!.accessToken
    )
    setActionsDeLaPage(actions)
    setPageCourante(page)
  }

  useMatomo(trackingLabel)

  useEffect(() => {
    setIdCurrentJeune(jeune.id)
  }, [jeune, setIdCurrentJeune])

  function getPages() {
    const pages = []

    if (pageCount <= 6) {
      for (let count = 1; count <= pageCount; count++) {
        pages.push(
          <PaginationItem
            key={`Page-${count}`}
            page={count}
            label={`Page ${count}`}
            onClick={goToActionPage}
            isActive={pageCourante === count}
          >
            {count}
          </PaginationItem>
        )
      }
      return pages
    }

    function truncate(count: number) {
      return (
        // FIXME afficher les pages cachées ?
        <span key={`truncate-${count}`} aria-label='pages cachées'>
          &#8230;
        </span>
      )
    }

    if (pageCourante > 3) {
      pages.push(
        <PaginationItem
          key={`Page-1`}
          page={1}
          label={`Page 1`}
          onClick={goToActionPage}
          isActive={pageCourante === 1}
        >
          1
        </PaginationItem>
      )
    }

    if (pageCourante > 4) {
      pages.push(truncate(1))
    }

    let groupStart: number = Math.max(1, pageCourante - 2)
    if (pageCourante >= pageCount - 1) {
      groupStart = pageCount - 4
    }

    for (
      let count = groupStart;
      count <= Math.min(groupStart + 4, pageCount);
      count++
    ) {
      pages.push(
        <PaginationItem
          key={`Page-${count}`}
          page={count}
          label={`Page ${count}`}
          onClick={goToActionPage}
          isActive={pageCourante === count}
        >
          {count}
        </PaginationItem>
      )
    }

    if (pageCount > 6 && pageCourante < pageCount - 3) {
      pages.push(truncate(2))
    }

    if (pageCount > 5 && pageCourante < pageCount - 2) {
      pages.push(
        <PaginationItem
          key={`Page-${pageCount}`}
          page={pageCount}
          label={`Page ${pageCount}`}
          onClick={goToActionPage}
          isActive={pageCourante === pageCount}
        >
          {pageCount}
        </PaginationItem>
      )
    }

    return pages
  }

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

        {!jeune.isActivated && (
          <ButtonLink
            href={`/mes-jeunes/${jeune.id}/suppression`}
            style={ButtonStyle.SECONDARY}
            className='w-fit'
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
          count={!isPoleEmploi ? actionsInitiales.total : undefined}
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
          className='mt-8 pb-8'
        >
          {isPoleEmploi && (
            <IntegrationPoleEmploi label='actions et démarches' />
          )}

          {!isPoleEmploi && (
            <>
              <TableauActionsJeune jeune={jeune} actions={actionsDeLaPage} />
              <nav aria-label='pagination actions' className='mt-2'>
                <ul className='flex justify-between items-center'>
                  <PaginationItem
                    page={1}
                    label='Première page'
                    onClick={goToActionPage}
                    disabled={pageCourante <= 1}
                  >
                    <IconComponent
                      name={IconName.ChevronFirst}
                      className={`fill-inherit w-6 h-6`}
                    />
                  </PaginationItem>
                  <PaginationItem
                    page={pageCourante - 1}
                    label='Page précédente'
                    onClick={goToActionPage}
                    disabled={pageCourante <= 1}
                  >
                    <IconComponent
                      name={IconName.ChevronLeft}
                      className='fill-inherit w-6 h-6'
                    />
                  </PaginationItem>
                  {getPages()}
                  <PaginationItem
                    page={pageCourante + 1}
                    label='Page suivante'
                    onClick={goToActionPage}
                    disabled={pageCourante >= pageCount}
                  >
                    <IconComponent
                      name={IconName.ChevronRight}
                      className={`fill-inherit w-6 h-6`}
                    />
                  </PaginationItem>
                  <PaginationItem
                    page={pageCount}
                    label='Dernière page'
                    onClick={goToActionPage}
                    disabled={pageCourante >= pageCount}
                  >
                    <IconComponent
                      name={IconName.ChevronLast}
                      className={`fill-inherit w-6 h-6`}
                    />
                  </PaginationItem>
                </ul>
              </nav>
            </>
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
  const page = parseInt(context.query.page as string, 10) || 1
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
      ? { actions: [], total: 0 }
      : actionsService.getActionsJeune(
          context.query.jeune_id as string,
          page,
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
    actionsInitiales: { ...actions, page },
    conseillers,
    pageTitle: `Mes jeunes - ${jeune.prenom} ${jeune.nom}`,
    pageHeader: `${jeune.prenom} ${jeune.nom}`,
  }
  if (context.query.creationRdv)
    props.rdvCreationSuccess = context.query.creationRdv === 'succes'

  if (context.query.modificationRdv)
    props.rdvModificationSuccess = context.query.modificationRdv === 'succes'

  if (context.query.suppressionRdv)
    props.rdvSuppressionSuccess = context.query.suppressionRdv === 'succes'

  if (context.query.creationAction)
    props.actionCreationSuccess = context.query.creationAction === 'succes'

  if (context.query.envoiMessage)
    props.messageEnvoiGroupeSuccess = context.query.envoiMessage === 'succes'

  if (context.query.onglet) {
    props.onglet =
      context.query.onglet === 'actions' ? Onglet.ACTIONS : Onglet.RDVS
  }

  return {
    props,
  }
}

export default withTransaction(FicheJeune.name, 'page')(FicheJeune)
