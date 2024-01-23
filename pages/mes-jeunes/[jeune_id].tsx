import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import DetailsJeune from 'components/jeune/DetailsJeune'
import { ResumeFavorisBeneficiaire } from 'components/jeune/ResumeFavorisBeneficiaire'
import { ResumeIndicateursJeune } from 'components/jeune/ResumeIndicateursJeune'
import { TabFavoris } from 'components/jeune/TabFavoris'
import PageActionsPortal from 'components/PageActionsPortal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Action, StatutAction } from 'interfaces/action'
import { Agenda } from 'interfaces/agenda'
import {
  Conseiller,
  estMilo,
  estPoleEmploi,
  estUserPoleEmploi,
  peutAccederAuxSessions,
} from 'interfaces/conseiller'
import { EvenementListItem, PeriodeEvenements } from 'interfaces/evenement'
import { Offre, Recherche } from 'interfaces/favoris'
import {
  DetailJeune,
  IndicateursSemaine,
  MetadonneesFavoris,
} from 'interfaces/jeune'
import { SuppressionJeuneFormData } from 'interfaces/json/jeune'
import { PageProps } from 'interfaces/pageProps'
import { MotifSuppressionJeune } from 'interfaces/referentiel'
import { AlerteParam } from 'referentiel/alerteParam'
import { getIndicateursJeuneAlleges } from 'services/jeunes.service'
import { MetadonneesPagination } from 'types/pagination'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useCurrentJeune } from 'utils/chat/currentJeuneContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { compareDates } from 'utils/date'
import { ApiError } from 'utils/httpClient'
import { usePortefeuille } from 'utils/portefeuilleContext'

const DeleteJeuneActifModal = dynamic(
  import('components/jeune/DeleteJeuneActifModal'),
  { ssr: false }
)
const DeleteJeuneInactifModal = dynamic(
  import('components/jeune/DeleteJeuneInactifModal'),
  { ssr: false }
)

const OngletActions = dynamic(import('components/action/OngletActions'))
const OngletAgendaBeneficiaire = dynamic(
  import('components/agenda-jeune/OngletAgendaBeneficiaire')
)
const OngletRdvsBeneficiaire = dynamic(
  import('components/rdv/OngletRdvsBeneficiaire')
)
const BlocFavoris = dynamic(import('components/jeune/BlocFavoris'))

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
    metadonnees: MetadonneesPagination
    page: number
  }
  lectureSeule?: boolean
  metadonneesFavoris?: MetadonneesFavoris
  onglet?: Onglet
  offresPE?: Offre[]
  recherchesPE?: Recherche[]
}

function FicheJeune({
  jeune,
  rdvs,
  actionsInitiales,
  metadonneesFavoris,
  onglet,
  lectureSeule,
  offresPE,
  recherchesPE,
}: FicheJeuneProps) {
  const router = useRouter()
  const pathPrefix = router.asPath.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  const [portefeuille, setPortefeuille] = usePortefeuille()
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

  const aujourdHui = DateTime.now()
  const debutSemaine = aujourdHui.startOf('week')
  const finSemaine = aujourdHui.endOf('week')

  let pageTracking: string = jeune.isActivated
    ? 'Détail jeune'
    : 'Détail jeune - Non Activé'
  if (lectureSeule) pageTracking += ' - hors portefeuille'
  let initialTracking = pageTracking
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

  const [trackingLabel, setTrackingLabel] = useState<string>(initialTracking)
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  const totalFavoris = metadonneesFavoris
    ? metadonneesFavoris.offres.total + metadonneesFavoris.recherches.total
    : 0

  function trackDossierMiloClick() {
    setTrackingLabel(pageTracking + ' - Dossier i-Milo')
  }

  async function switchTab(tab: Onglet) {
    setCurrentTab(tab)

    setTrackingLabel(
      `${pageTracking} - Consultation ${ongletProps[tab].trackingLabel}`
    )

    await router.replace(
      {
        pathname: `${pathPrefix}/${jeune.id}`,
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
    tri: string
  ): Promise<{ actions: Action[]; metadonnees: MetadonneesPagination }> {
    const { getActionsJeuneClientSide } = await import(
      'services/actions.service'
    )
    const result = await getActionsJeuneClientSide(jeune.id, {
      page,
      statuts,
      tri,
    })

    setTotalActions(result.metadonnees.nombreTotal)
    return result
  }

  async function recupererAgenda(): Promise<Agenda> {
    const { recupererAgenda: _recupererAgenda } = await import(
      'services/agenda.service'
    )
    return _recupererAgenda(jeune.id, DateTime.now())
  }

  async function openDeleteJeuneModal(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault()
    e.stopPropagation()

    if (jeune.isActivated) {
      setShowModaleDeleteJeuneActif(true)

      if (motifsSuppression.length === 0) {
        const { getMotifsSuppression } = await import('services/jeunes.service')
        const result = await getMotifsSuppression()
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
      const { archiverJeune } = await import('services/jeunes.service')
      await archiverJeune(jeune.id, payload)

      removeBeneficiaireFromPortefeuille(jeune.id)
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
      const { supprimerJeuneInactif: _supprimerJeuneInactif } = await import(
        'services/jeunes.service'
      )
      await _supprimerJeuneInactif(jeune.id)

      removeBeneficiaireFromPortefeuille(jeune.id)
      setAlerte(AlerteParam.suppressionBeneficiaire)
      await router.push('/mes-jeunes')
    } catch (e) {
      setShowSuppressionCompteBeneficiaireError(true)
      setTrackingLabel(`${pageTracking} - Erreur suppr. compte`)
    } finally {
      setShowModaleDeleteJeuneInactif(false)
    }
  }

  function removeBeneficiaireFromPortefeuille(idBeneficiaire: string): void {
    const updatedPortefeuille = [...portefeuille]
    const index = updatedPortefeuille.findIndex(
      ({ id }) => id === idBeneficiaire
    )
    updatedPortefeuille.splice(index, 1)
    setPortefeuille(updatedPortefeuille)
    setIdCurrentJeune(undefined)
  }

  useMatomo(trackingLabel, aDesBeneficiaires)

  useEffect(() => {
    if (!lectureSeule) setIdCurrentJeune(jeune.id)
  }, [jeune, lectureSeule])

  // On récupère les indicateurs ici parce qu'on a besoin de la timezone du navigateur
  useEffect(() => {
    if (!estPoleEmploi(conseiller) && !indicateursSemaine) {
      getIndicateursJeuneAlleges(
        conseiller.id,
        jeune.id,
        debutSemaine,
        finSemaine
      ).then(setIndicateursSemaine)
    }
  }, [conseiller, debutSemaine, finSemaine, indicateursSemaine, jeune.id])

  return (
    <>
      {!lectureSeule && (
        <PageActionsPortal>
          <Button onClick={openDeleteJeuneModal} style={ButtonStyle.SECONDARY}>
            <IconComponent
              name={IconName.Delete}
              focusable={false}
              aria-hidden={true}
              className='mr-2 w-4 h-4'
            />
            Supprimer ce compte
          </Button>
        </PageActionsPortal>
      )}

      {showSuppressionCompteBeneficiaireError && (
        <FailureAlert
          label='Suite à un problème inconnu la suppression a échoué. Vous pouvez réessayer.'
          onAcknowledge={() => setShowSuppressionCompteBeneficiaireError(false)}
        />
      )}

      {!jeune.isActivated && (
        <FailureAlert label='Ce bénéficiaire ne s’est pas encore connecté à l’application' />
      )}

      {!jeune.isActivated && estMilo(conseiller) && (
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
            iconName={IconName.Schedule}
            label='Ce bénéficiaire a été ajouté temporairement à votre portefeuille en attendant le retour de son conseiller initial.'
          />
        </div>
      )}

      {jeune.structureMilo?.id !== conseiller.structureMilo?.id && (
        <div className='mb-6'>
          <FailureAlert label='Ce bénéficiaire est rattaché à une Mission Locale différente de la vôtre. Il ne pourra ni visualiser les événements partagés ni y être inscrit.' />
        </div>
      )}

      {lectureSeule && (
        <div className='mb-6'>
          <InformationMessage label='Vous êtes en lecture seule'>
            Vous pouvez uniquement lire la fiche de ce bénéficiaire car il ne
            fait pas partie de votre portefeuille.
          </InformationMessage>
        </div>
      )}

      <div className='mb-6'>
        <DetailsJeune
          jeune={jeune}
          conseiller={conseiller}
          onDossierMiloClick={trackDossierMiloClick}
        />
      </div>

      {!estPoleEmploi(conseiller) && (
        <>
          <ResumeIndicateursJeune
            idJeune={jeune.id}
            debutDeLaSemaine={debutSemaine}
            finDeLaSemaine={finSemaine}
            indicateursSemaine={indicateursSemaine}
          />

          <div className='flex justify-between mt-6 mb-4'>
            <div className='flex'>
              {!lectureSeule && (
                <>
                  <ButtonLink
                    href={`/mes-jeunes/edition-rdv?idJeune=${jeune.id}`}
                  >
                    <IconComponent
                      name={IconName.Add}
                      focusable='false'
                      aria-hidden='true'
                      className='mr-2 w-4 h-4'
                    />
                    Créer un rendez-vous
                  </ButtonLink>

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
                    Créer une action
                  </ButtonLink>
                </>
              )}

              <ButtonLink
                href='/agenda?onglet=etablissement'
                className='ml-4'
                style={ButtonStyle.TERTIARY}
              >
                <IconComponent
                  name={IconName.Add}
                  focusable='false'
                  aria-hidden='true'
                  className='mr-2 w-4 h-4'
                />
                Inscrire à une animation collective
              </ButtonLink>
            </div>
          </div>

          <TabList className='mt-10'>
            <Tab
              label='Agenda'
              selected={currentTab === Onglet.AGENDA}
              controls='agenda'
              onSelectTab={() => switchTab(Onglet.AGENDA)}
              iconName={IconName.EventFill}
            />
            <Tab
              label='Actions'
              count={!estPoleEmploi(conseiller) ? totalActions : undefined}
              selected={currentTab === Onglet.ACTIONS}
              controls='liste-actions'
              onSelectTab={() => switchTab(Onglet.ACTIONS)}
              iconName={IconName.ChecklistRtlFill}
            />
            <Tab
              label='Rendez-vous'
              count={!estPoleEmploi(conseiller) ? rdvs.length : undefined}
              selected={currentTab === Onglet.RDVS}
              controls='liste-rdvs'
              onSelectTab={() => switchTab(Onglet.RDVS)}
              iconName={IconName.EventFill}
            />
            {metadonneesFavoris && (
              <Tab
                label='Favoris'
                count={totalFavoris}
                selected={currentTab === Onglet.FAVORIS}
                controls='liste-favoris'
                onSelectTab={() => switchTab(Onglet.FAVORIS)}
                iconName={IconName.FavoriteFill}
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
                conseiller={conseiller}
                beneficiaire={jeune}
                rdvs={rdvs}
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
                conseiller={conseiller}
                jeune={jeune}
                actionsInitiales={actionsInitiales}
                lectureSeule={lectureSeule}
                getActions={chargerActions}
              />
            </div>
          )}

          {currentTab === Onglet.FAVORIS && metadonneesFavoris && (
            <div
              role='tabpanel'
              aria-labelledby='liste-favoris--tab'
              tabIndex={0}
              id='liste-favoris'
              className='mt-8 pb-8'
            >
              <BlocFavoris
                idJeune={jeune.id}
                metadonneesFavoris={metadonneesFavoris}
              />
            </div>
          )}
        </>
      )}

      {estPoleEmploi(conseiller) && (
        <>
          {metadonneesFavoris?.autoriseLePartage &&
            offresPE &&
            recherchesPE && (
              <>
                <h2 className='text-m-bold text-grey_800 mb-4'>Favoris</h2>
                <p className='text-base-regular'>
                  Retrouvez les offres et recherches que votre bénéficiaire a
                  mises en favoris.
                </p>
                <TabFavoris
                  offres={offresPE}
                  recherches={recherchesPE}
                  lectureSeule={lectureSeule}
                />
              </>
            )}
          {metadonneesFavoris && !metadonneesFavoris?.autoriseLePartage && (
            <ResumeFavorisBeneficiaire
              metadonneesFavoris={metadonneesFavoris}
            />
          )}
        </>
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
    </>
  )
}

export const getServerSideProps: GetServerSideProps<FicheJeuneProps> = async (
  context
) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }
  const {
    session: { accessToken, user },
  } = sessionOrRedirect

  const userIsPoleEmploi = estUserPoleEmploi(user)
  const page = parseInt(context.query.page as string, 10) || 1

  const { getConseillerServerSide } = await import(
    'services/conseiller.service'
  )
  const { getJeuneDetails, getMetadonneesFavorisJeune } = await import(
    'services/jeunes.service'
  )
  const { getSessionsMiloBeneficiaire } = await import(
    'services/sessions.service'
  )
  const { getRendezVousJeune } = await import('services/evenements.service')
  const { getActionsJeuneServerSide } = await import('services/actions.service')
  const { getOffres, getRecherchesSauvegardees } = await import(
    'services/favoris.service'
  )

  let conseiller: Conseiller | undefined
  try {
    conseiller = await getConseillerServerSide(user, accessToken)
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 401) {
      return {
        redirect: {
          destination: '/api/auth/federated-logout',
          permanent: false,
        },
      }
    }
    throw e
  }

  if (!conseiller) {
    return { notFound: true }
  }

  const [jeune, metadonneesFavoris, rdvs, actions] = await Promise.all([
    getJeuneDetails(context.query.jeune_id as string, accessToken),
    getMetadonneesFavorisJeune(context.query.jeune_id as string, accessToken),
    userIsPoleEmploi
      ? ([] as EvenementListItem[])
      : getRendezVousJeune(
          context.query.jeune_id as string,
          PeriodeEvenements.FUTURS,
          accessToken
        ),
    userIsPoleEmploi
      ? { actions: [], metadonnees: { nombreTotal: 0, nombrePages: 0 } }
      : getActionsJeuneServerSide(
          context.query.jeune_id as string,
          page,
          accessToken
        ),
  ])

  let sessionsMilo: EvenementListItem[] = []

  if (peutAccederAuxSessions(conseiller)) {
    try {
      sessionsMilo = await getSessionsMiloBeneficiaire(
        context.query.jeune_id as string,
        accessToken,
        DateTime.now().startOf('day')
      )
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 401) {
        return {
          redirect: {
            destination: '/api/auth/federated-logout',
            permanent: false,
          },
        }
      }

      sessionsMilo = []
    }
  }

  if (!jeune) {
    return { notFound: true }
  }

  let offresPE: Offre[] = []
  let recherchesPE: Recherche[] = []

  if (metadonneesFavoris?.autoriseLePartage) {
    ;[offresPE, recherchesPE] = await Promise.all([
      userIsPoleEmploi
        ? getOffres(context.query.jeune_id as string, accessToken)
        : [],
      userIsPoleEmploi
        ? getRecherchesSauvegardees(
            context.query.jeune_id as string,
            accessToken
          )
        : [],
    ])
  }

  const rdvsEtSessionsTriesParDate = [...rdvs]
    .concat(sessionsMilo)
    .sort((event1, event2) =>
      compareDates(DateTime.fromISO(event1.date), DateTime.fromISO(event2.date))
    )

  const props: FicheJeuneProps = {
    jeune,
    metadonneesFavoris,
    rdvs: rdvsEtSessionsTriesParDate,
    actionsInitiales: { ...actions, page },
    pageTitle: `Portefeuille - ${jeune.prenom} ${jeune.nom}`,
    pageHeader: `${jeune.prenom} ${jeune.nom}`,
    offresPE,
    recherchesPE,
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

  if (jeune.idConseiller !== user.id) {
    props.lectureSeule = true
    props.pageTitle = `Établissement - ${jeune.prenom} ${jeune.nom}`
  }

  return {
    props,
  }
}

export default withTransaction(FicheJeune.name, 'page')(FicheJeune)
