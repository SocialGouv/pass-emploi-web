import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import { OngletActions } from 'components/action/OngletActions'
import { CollapseButton } from 'components/jeune/CollapseButton'
import DeleteJeuneActifModal from 'components/jeune/DeleteJeuneActifModal'
import DeleteJeuneInactifModal from 'components/jeune/DeleteJeuneInactifModal'
import { DetailsJeune } from 'components/jeune/DetailsJeune'
import { ListeConseillersJeune } from 'components/jeune/ListeConseillersJeune'
import { OngletRdvs } from 'components/rdv/OngletRdvs'
import Button, { ButtonStyle } from 'components/ui/Button'
import ButtonLink from 'components/ui/ButtonLink'
import FailureAlert from 'components/ui/FailureAlert'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import InformationMessage from 'components/ui/InformationMessage'
import Tab from 'components/ui/Tab'
import TabList from 'components/ui/TabList'
import { Action, MetadonneesActions, StatutAction } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  ConseillerHistorique,
  DetailJeune,
  MetadonneesFavoris,
} from 'interfaces/jeune'
import { SuppressionJeuneFormData } from 'interfaces/json/jeune'
import { PageProps } from 'interfaces/pageProps'
import { RdvListItem, rdvToListItem } from 'interfaces/rdv'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { ActionsService } from 'services/actions.service'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useCurrentJeune } from 'utils/chat/currentJeuneContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
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
  metadonneesFavoris?: MetadonneesFavoris
  rdvCreationSuccess?: boolean
  rdvModificationSuccess?: boolean
  rdvSuppressionSuccess?: boolean
  actionCreationSuccess?: boolean
  messageEnvoiGroupeSuccess?: boolean
  onglet?: Onglet
}

function FicheJeune({
  jeune,
  rdvs,
  actionsInitiales,
  metadonneesFavoris,
  conseillers,
  rdvCreationSuccess,
  rdvModificationSuccess,
  rdvSuppressionSuccess,
  actionCreationSuccess,
  messageEnvoiGroupeSuccess,
  onglet,
}: FicheJeuneProps) {
  const actionsService = useDependance<ActionsService>('actionsService')
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const router = useRouter()
  const [, setIdCurrentJeune] = useCurrentJeune()
  const [conseiller] = useConseiller()

  const listeConseillersReduite = conseillers.slice(0, 5)
  const [conseillersAffiches, setConseillersAffiches] = useState<
    ConseillerHistorique[]
  >(listeConseillersReduite)
  const [expandListeConseillers, setExpandListeConseillers] =
    useState<boolean>(false)

  const [motifsSuppression, setMotifsSuppression] = useState<string[]>([])

  const [currentTab, setCurrentTab] = useState<Onglet>(onglet ?? Onglet.RDVS)
  const [totalActions, setTotalActions] = useState<number>(
    actionsInitiales.metadonnees.nombreTotal
  )

  const [showModaleDeleteJeuneActif, setShowModaleDeleteJeuneActif] =
    useState<boolean>(false)
  const [showModaleDeleteJeuneInactif, setShowModaleDeleteJeuneInactif] =
    useState<boolean>(false)

  const [
    showSuppressionCompteBeneficiaireError,
    setShowSuppressionCompteBeneficiaireError,
  ] = useState<boolean>(false)

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

  const isPoleEmploi = conseiller?.structure === StructureConseiller.POLE_EMPLOI

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
    statuts: StatutAction[],
    tri: string
  ): Promise<{ actions: Action[]; metadonnees: MetadonneesActions }> {
    const result = await actionsService.getActionsJeuneClientSide(jeune.id, {
      page,
      statuts,
      tri,
    })

    setTotalActions(result.metadonnees.nombreTotal)
    return result
  }

  async function openDeleteJeuneModal(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault()
    e.stopPropagation()

    if (jeune.isActivated) {
      setShowModaleDeleteJeuneActif(true)

      if (motifsSuppression.length === 0) {
        const result = await jeunesService.getMotifsSuppression()
        setMotifsSuppression(result)
      }
    }

    if (!jeune.isActivated) {
      setShowModaleDeleteJeuneInactif(true)
    }
  }

  async function archiverJeuneActif(
    payload: SuppressionJeuneFormData
  ): Promise<void> {
    try {
      await jeunesService.archiverJeune(jeune.id, payload)
      await router.push(
        `/mes-jeunes?${QueryParam.suppressionBeneficiaire}=${QueryValue.succes}`
      )
    } catch (e) {
      setShowSuppressionCompteBeneficiaireError(true)
      setTrackingLabel(`${pageTracking} - Erreur suppr. compte`)
    } finally {
      setShowModaleDeleteJeuneActif(false)
    }
  }

  async function supprimerJeuneInactif(): Promise<void> {
    try {
      await jeunesService.supprimerJeuneInactif(jeune.id)
      await router.push(
        `/mes-jeunes?${QueryParam.suppressionBeneficiaire}=${QueryValue.succes}`
      )
    } catch (e) {
      setShowSuppressionCompteBeneficiaireError(true)
      setTrackingLabel(`${pageTracking} - Erreur suppr. compte`)
    } finally {
      setShowModaleDeleteJeuneInactif(false)
    }
  }

  useMatomo(trackingLabel)

  useEffect(() => {
    setIdCurrentJeune(jeune.id)
  }, [jeune, setIdCurrentJeune])

  return (
    <>
      {showSuppressionCompteBeneficiaireError && (
        <FailureAlert
          label='Suite à un problème inconnu la suppression a échoué. Vous pouvez réessayer.'
          onAcknowledge={() => setShowSuppressionCompteBeneficiaireError(false)}
        />
      )}

      {showModaleDeleteJeuneActif && (
        <DeleteJeuneActifModal
          jeune={jeune}
          onClose={() => setShowModaleDeleteJeuneActif(false)}
          motifsSuppression={motifsSuppression}
          soumettreSuppression={archiverJeuneActif}
        />
      )}

      {showModaleDeleteJeuneInactif && (
        <DeleteJeuneInactifModal
          jeune={jeune}
          onClose={() => setShowModaleDeleteJeuneInactif(false)}
          onDelete={supprimerJeuneInactif}
        />
      )}

      {!jeune.isActivated && (
        <>
          <FailureAlert label='Ce bénéficiaire ne s’est pas encore connecté à l’application' />
          <div className='mb-8'>
            <InformationMessage
              content={[
                'Le lien d’activation est valable 12h.',
                'Si le délai est dépassé, veuillez orienter ce bénéficiaire vers l’option : mot de passe oublié.',
              ]}
            />
          </div>
        </>
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
          onClick={openDeleteJeuneModal}
          style={ButtonStyle.SECONDARY}
          className='w-fit'
        >
          Supprimer ce compte
        </Button>
      </div>

      <DetailsJeune
        jeune={jeune}
        structureConseiller={conseiller?.structure}
        metadonneesFavoris={metadonneesFavoris}
        onDossierMiloClick={trackDossierMiloClick}
      />

      <div className='border border-solid rounded-medium w-full p-4 mt-3 border-grey_100'>
        <h2 className='text-base-bold mb-4'>Historique des conseillers</h2>
        <ListeConseillersJeune
          id='liste-conseillers'
          conseillers={conseillersAffiches}
        />
        {conseillers.length > 5 && (
          <div className='flex justify-end mt-8'>
            <CollapseButton
              controlledId='liste-conseillers'
              isOpen={expandListeConseillers}
              onClick={toggleListeConseillers}
            />
          </div>
        )}
      </div>

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
            idConseiller={conseiller?.id ?? ''}
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
      user: { structure, id },
    },
  } = sessionOrRedirect

  const isPoleEmploi = structure === StructureConseiller.POLE_EMPLOI
  const page = parseInt(context.query.page as string, 10) || 1
  const [jeune, conseillers, metadonneesFavoris, rdvs, actions] =
    await Promise.all([
      jeunesService.getJeuneDetails(
        context.query.jeune_id as string,
        accessToken
      ),
      jeunesService.getConseillersDuJeuneServerSide(
        context.query.jeune_id as string,
        accessToken
      ),
      jeunesService.getMetadonneesFavorisJeune(
        id,
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
        : actionsService.getActionsJeuneServerSide(
            context.query.jeune_id as string,
            { page, statuts: [] },
            accessToken
          ),
    ])

  if (!jeune) {
    return { notFound: true }
  }

  const now = new Date()
  const props: FicheJeuneProps = {
    jeune,
    conseillers,
    metadonneesFavoris,
    rdvs: rdvs.filter((rdv) => new Date(rdv.date) > now).map(rdvToListItem),
    actionsInitiales: { ...actions, page },
    pageTitle: `Portefeuille - ${jeune.prenom} ${jeune.nom}`,
    pageHeader: `${jeune.prenom} ${jeune.nom}`,
  }

  if (context.query[QueryParam.creationRdv])
    props.rdvCreationSuccess =
      context.query[QueryParam.creationRdv] === QueryValue.succes

  if (context.query[QueryParam.modificationRdv])
    props.rdvModificationSuccess =
      context.query[QueryParam.modificationRdv] === QueryValue.succes

  if (context.query[QueryParam.suppressionRdv])
    props.rdvSuppressionSuccess =
      context.query[QueryParam.suppressionRdv] === QueryValue.succes

  if (context.query[QueryParam.creationAction])
    props.actionCreationSuccess =
      context.query[QueryParam.creationAction] === QueryValue.succes

  if (context.query[QueryParam.envoiMessage])
    props.messageEnvoiGroupeSuccess =
      context.query[QueryParam.envoiMessage] === QueryValue.succes

  if (context.query.onglet) {
    props.onglet =
      context.query.onglet === 'actions' ? Onglet.ACTIONS : Onglet.RDVS
  }

  return {
    props,
  }
}

export default withTransaction(FicheJeune.name, 'page')(FicheJeune)
