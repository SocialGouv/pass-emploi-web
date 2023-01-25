import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'

import { OngletActions } from 'components/action/OngletActions'
import { OngletAgendaBeneficiaire } from 'components/agenda-jeune/OngletAgendaBeneficiaire'
import { BlocFavoris } from 'components/jeune/BlocFavoris'
import DeleteJeuneActifModal from 'components/jeune/DeleteJeuneActifModal'
import DeleteJeuneInactifModal from 'components/jeune/DeleteJeuneInactifModal'
import { DetailsJeune } from 'components/jeune/DetailsJeune'
import { ResumeIndicateursJeune } from 'components/jeune/ResumeIndicateursJeune'
import { OngletRdvsBeneficiaire } from 'components/rdv/OngletRdvsBeneficiaire'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import {
  Action,
  EtatQualificationAction,
  MetadonneesActions,
  StatutAction,
} from 'interfaces/action'
import { Agenda } from 'interfaces/agenda'
import { StructureConseiller } from 'interfaces/conseiller'
import { EvenementListItem, PeriodeEvenements } from 'interfaces/evenement'
import {
  DetailJeune,
  IndicateursSemaine,
  MetadonneesFavoris,
} from 'interfaces/jeune'
import { SuppressionJeuneFormData } from 'interfaces/json/jeune'
import { PageProps } from 'interfaces/pageProps'
import { MotifSuppressionJeune } from 'interfaces/referentiel'
import { AlerteParam } from 'referentiel/alerteParam'
import { ActionsService } from 'services/actions.service'
import { AgendaService } from 'services/agenda.service'
import { EvenementsService } from 'services/evenements.service'
import { JeunesService } from 'services/jeunes.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useCurrentJeune } from 'utils/chat/currentJeuneContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

export enum Onglet {
  AGENDA = 'AGENDA',
  ACTIONS = 'ACTIONS',
  RDVS = 'RDVS',
  FAVORIS = 'FAVORIS',
}

const ongletProps: {
  [key in Onglet]: { queryParam: string; trackingLabel: string }
} = {
  AGENDA: { queryParam: 'agenda', trackingLabel: 'Agenda' },
  ACTIONS: { queryParam: 'actions', trackingLabel: 'Actions' },
  RDVS: { queryParam: 'rdvs', trackingLabel: 'Événements' },
  FAVORIS: { queryParam: 'favoris', trackingLabel: 'Favoris' },
}

interface FicheJeuneProps extends PageProps {
  jeune: DetailJeune
  rdvs: EvenementListItem[]
  actionsInitiales: {
    actions: Action[]
    metadonnees: MetadonneesActions
    page: number
  }
  metadonneesFavoris?: MetadonneesFavoris
  onglet?: Onglet
}

function FicheJeune({
  jeune,
  rdvs,
  actionsInitiales,
  metadonneesFavoris,
  onglet,
}: FicheJeuneProps) {
  const actionsService = useDependance<ActionsService>('actionsService')
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const agendaService = useDependance<AgendaService>('agendaService')
  const router = useRouter()
  const [, setIdCurrentJeune] = useCurrentJeune()
  const [conseiller] = useConseiller()
  const [alerte, setAlerte] = useAlerte()

  const [motifsSuppression, setMotifsSuppression] = useState<
    MotifSuppressionJeune[]
  >([])

  const [currentTab, setCurrentTab] = useState<Onglet>(onglet ?? Onglet.AGENDA)
  const [totalActions, setTotalActions] = useState<number>(
    actionsInitiales.metadonnees.nombreTotal
  )
  const [indicateursSemaine, setIndicateursSemaine] = useState<
    IndicateursSemaine | undefined
  >()

  const [showModaleDeleteJeuneActif, setShowModaleDeleteJeuneActif] =
    useState<boolean>(false)
  const [showModaleDeleteJeuneInactif, setShowModaleDeleteJeuneInactif] =
    useState<boolean>(false)

  const [
    showSuppressionCompteBeneficiaireError,
    setShowSuppressionCompteBeneficiaireError,
  ] = useState<boolean>(false)

  const aujourdHui = useMemo(() => DateTime.now(), [])
  const debutSemaine = useMemo(() => aujourdHui.startOf('week'), [aujourdHui])
  const finSemaine = useMemo(() => aujourdHui.endOf('week'), [aujourdHui])

  const pageTracking: string = jeune.isActivated
    ? 'Détail jeune'
    : 'Détail jeune - Non Activé'
  let initialTracking = pageTracking
  if (alerte?.key === AlerteParam.creationEvenement)
    initialTracking += ' - Creation rdv succès'
  if (alerte?.key === AlerteParam.modificationEvenement)
    initialTracking += ' - Modification rdv succès'
  if (alerte?.key === AlerteParam.suppressionEvenement)
    initialTracking += ' - Suppression rdv succès'
  if (alerte?.key === AlerteParam.creationAction)
    initialTracking += ' - Succès creation action'
  if (alerte?.key === AlerteParam.envoiMessage)
    initialTracking += ' - Succès envoi message'
  const [trackingLabel, setTrackingLabel] = useState<string>(initialTracking)

  const isPoleEmploi = conseiller?.structure === StructureConseiller.POLE_EMPLOI
  const isMilo = conseiller?.structure === StructureConseiller.MILO

  const totalFavoris = metadonneesFavoris
    ? metadonneesFavoris.offres.total + metadonneesFavoris.recherches.total
    : 0

  function trackDossierMiloClick() {
    setTrackingLabel(pageTracking + ' - Dossier i-Milo')
  }

  async function switchTab(tab: Onglet) {
    setCurrentTab(tab)

    setTrackingLabel(
      pageTracking + ' - Consultation ' + ongletProps[tab].trackingLabel
    )
    await router.replace(
      {
        pathname: `/mes-jeunes/${jeune.id}`,
        query: { onglet: ongletProps[tab].queryParam },
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
    etatsQualification: EtatQualificationAction[],
    tri: string
  ): Promise<{ actions: Action[]; metadonnees: MetadonneesActions }> {
    const result = await actionsService.getActionsJeuneClientSide(jeune.id, {
      page,
      statuts,
      etatsQualification,
      tri,
    })

    setTotalActions(result.metadonnees.nombreTotal)
    return result
  }

  async function recupererAgenda(): Promise<Agenda> {
    return agendaService.recupererAgenda(jeune.id, DateTime.now())
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
      setAlerte(AlerteParam.suppressionBeneficiaire)
      await router.push('/mes-jeunes')
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
      setAlerte(AlerteParam.suppressionBeneficiaire)
      await router.push('/mes-jeunes')
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

  // On récupère les indicateurs ici parce qu'on a besoin de la timezone du navigateur
  useEffect(() => {
    if (conseiller && !isPoleEmploi && !indicateursSemaine) {
      jeunesService
        .getIndicateursJeuneAlleges(
          conseiller.id,
          jeune.id,
          debutSemaine,
          finSemaine
        )
        .then(setIndicateursSemaine)
    }
  }, [
    conseiller,
    debutSemaine,
    finSemaine,
    indicateursSemaine,
    jeune.id,
    jeunesService,
    isPoleEmploi,
  ])

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
        <FailureAlert label='Ce bénéficiaire ne s’est pas encore connecté à l’application' />
      )}

      {!jeune.isActivated &&
        conseiller?.structure === StructureConseiller.MILO && (
          <div className='mb-8'>
            <InformationMessage label='Le lien d’activation est valable 12h.'>
              <p>
                Si le délai est dépassé, veuillez orienter ce bénéficiaire vers
                l’option : mot de passe oublié.
              </p>
            </InformationMessage>
          </div>
        )}

      {jeune.isReaffectationTemporaire && (
        <div className='mb-6'>
          <InformationMessage
            iconName={IconName.Clock}
            label='Ce bénéficiaire a été ajouté temporairement à votre portefeuille en attendant le retour de son conseiller initial.'
          />
        </div>
      )}

      <div className='mb-6'>
        <DetailsJeune
          jeune={jeune}
          structureConseiller={conseiller?.structure}
          onDossierMiloClick={trackDossierMiloClick}
          onDeleteJeuneClick={openDeleteJeuneModal}
        />
      </div>

      {!isPoleEmploi && (
        <ResumeIndicateursJeune
          idJeune={jeune.id}
          debutDeLaSemaine={debutSemaine}
          finDeLaSemaine={finSemaine}
          indicateursSemaine={indicateursSemaine}
        />
      )}

      <div className='flex justify-between mt-6 mb-4'>
        <div className='flex'>
          {!isPoleEmploi && (
            <ButtonLink href={`/mes-jeunes/edition-rdv?idJeune=${jeune.id}`}>
              <IconComponent
                name={IconName.Add}
                focusable='false'
                aria-hidden='true'
                className='mr-2 w-4 h-4'
              />
              Créer un événement
            </ButtonLink>
          )}

          {!isPoleEmploi && (
            <ButtonLink
              href={`/mes-jeunes/${jeune.id}/actions/nouvelle-action`}
              className='ml-4'
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
      </div>

      <TabList className='mt-10'>
        <Tab
          label='Agenda'
          selected={currentTab === Onglet.AGENDA}
          controls='agenda'
          onSelectTab={() => switchTab(Onglet.AGENDA)}
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
        <Tab
          label='Rendez-vous'
          count={!isPoleEmploi ? rdvs.length : undefined}
          selected={currentTab === Onglet.RDVS}
          controls='liste-rdvs'
          onSelectTab={() => switchTab(Onglet.RDVS)}
          iconName={IconName.Calendar}
        />
        {metadonneesFavoris && (
          <Tab
            label='Favoris'
            count={totalFavoris}
            selected={currentTab === Onglet.FAVORIS}
            controls='liste-favoris'
            onSelectTab={() => switchTab(Onglet.FAVORIS)}
            iconName={IconName.Favorite}
          />
        )}
      </TabList>

      {currentTab === Onglet.AGENDA && (
        <div
          role='tabpanel'
          aria-labelledby='agenda--tab'
          tabIndex={0}
          id='agenda'
          className='mt-8 pb-8 border-b border-primary_lighten'
        >
          <OngletAgendaBeneficiaire
            idBeneficiaire={jeune.id}
            isPoleEmploi={isPoleEmploi}
            recupererAgenda={recupererAgenda}
            goToActions={() => switchTab(Onglet.ACTIONS)}
          />
        </div>
      )}

      {currentTab === Onglet.RDVS && (
        <div
          role='tabpanel'
          aria-labelledby='liste-rdvs--tab'
          tabIndex={0}
          id='liste-rdvs'
          className='mt-8 pb-8 border-b border-primary_lighten'
        >
          <OngletRdvsBeneficiaire
            poleEmploi={isPoleEmploi}
            beneficiaire={jeune}
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
            afficherActions={!isPoleEmploi}
            afficherFiltresEtatsQualification={isMilo}
            jeune={jeune}
            actionsInitiales={actionsInitiales}
            getActions={chargerActions}
          />
        </div>
      )}
      {currentTab === Onglet.FAVORIS && (
        <div
          role='tabpanel'
          aria-labelledby='liste-favoris--tab'
          tabIndex={0}
          id='liste-favoris'
          className='mt-8 pb-8'
        >
          <BlocFavoris
            idJeune={jeune.id}
            metadonneesFavoris={metadonneesFavoris!}
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
    withDependance<EvenementsService>('evenementsService')
  const actionsService = withDependance<ActionsService>('actionsService')
  const {
    session: {
      accessToken,
      user: { structure },
    },
  } = sessionOrRedirect

  const isPoleEmploi = structure === StructureConseiller.POLE_EMPLOI
  const page = parseInt(context.query.page as string, 10) || 1
  const [jeune, metadonneesFavoris, rdvs, actions] = await Promise.all([
    jeunesService.getJeuneDetails(
      context.query.jeune_id as string,
      accessToken
    ),
    jeunesService.getMetadonneesFavorisJeune(
      context.query.jeune_id as string,
      accessToken
    ),
    isPoleEmploi
      ? []
      : rendezVousService.getRendezVousJeune(
          context.query.jeune_id as string,
          PeriodeEvenements.FUTURS,
          accessToken
        ),
    isPoleEmploi
      ? { actions: [], metadonnees: { nombreTotal: 0, nombrePages: 0 } }
      : actionsService.getActionsJeuneServerSide(
          context.query.jeune_id as string,
          page,
          accessToken
        ),
  ])

  if (!jeune) {
    return { notFound: true }
  }

  const props: FicheJeuneProps = {
    jeune,
    metadonneesFavoris,
    rdvs,
    actionsInitiales: { ...actions, page },
    pageTitle: `Portefeuille - ${jeune.prenom} ${jeune.nom}`,
    pageHeader: `${jeune.prenom} ${jeune.nom}`,
  }

  if (context.query.onglet) {
    switch (context.query.onglet) {
      case 'actions':
        props.onglet = Onglet.ACTIONS
        break
      case 'rdvs':
        props.onglet = Onglet.RDVS
        break
      case 'favoris':
        props.onglet = Onglet.FAVORIS
        break
      default:
        props.onglet = Onglet.AGENDA
    }
  }

  return {
    props,
  }
}

export default withTransaction(FicheJeune.name, 'page')(FicheJeune)
