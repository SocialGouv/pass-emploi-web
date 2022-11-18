import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import ConfirmationUpdateRdvModal from 'components/ConfirmationUpdateRdvModal'
import LeavePageConfirmationModal from 'components/LeavePageConfirmationModal'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import { EditionRdvForm } from 'components/rdv/EditionRdvForm'
import RenseignementAgenceModal from 'components/RenseignementAgenceModal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { StructureConseiller } from 'interfaces/conseiller'
import { Evenement, Modification, TypeEvenement } from 'interfaces/evenement'
import { BaseJeune, compareJeunesByNom } from 'interfaces/jeune'
import { EvenementFormData } from 'interfaces/json/evenement'
import { PageProps } from 'interfaces/pageProps'
import { Agence } from 'interfaces/referentiel'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { ConseillerService } from 'services/conseiller.service'
import { EvenementsService } from 'services/evenements.service'
import { JeunesService } from 'services/jeunes.service'
import { ReferentielService } from 'services/referentiel.service'
import { trackEvent } from 'utils/analytics/matomo'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { DATETIME_LONG, toFrenchFormat } from 'utils/date'
import { useLeavePageModal } from 'utils/hooks/useLeavePageModal'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
import { deleteQueryParams, parseUrl, setQueryParams } from 'utils/urlParser'

interface EditionRdvProps extends PageProps {
  jeunes: BaseJeune[]
  typesRendezVous: TypeEvenement[]
  returnTo: string
  idJeune?: string
  evenement?: Evenement
}

function EditionRdv({
  jeunes,
  typesRendezVous,
  idJeune,
  returnTo,
  evenement,
}: EditionRdvProps) {
  const router = useRouter()
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const rendezVousService =
    useDependance<EvenementsService>('rendezVousService')
  const [conseiller, setConseiller] = useConseiller()
  const referentielService =
    useDependance<ReferentielService>('referentielService')
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')

  const [showAgenceModal, setShowAgenceModal] = useState<boolean>(false)
  const [agences, setAgences] = useState<Agence[]>([])

  const [showLeavePageModal, setShowLeavePageModal] = useState<boolean>(false)
  const [confirmBeforeLeaving, setConfirmBeforeLeaving] =
    useState<boolean>(true)
  const [payloadForConfirmationModal, setPayloadForConfirmationModal] =
    useState<EvenementFormData | undefined>(undefined)

  const [showDeleteRdvModal, setShowDeleteRdvModal] = useState<boolean>(false)
  const [showDeleteRdvError, setShowDeleteRdvError] = useState<boolean>(false)

  const [
    formHasBeneficiaireAutrePortefeuille,
    setFormHasBeneficiaireAutrePortefeuille,
  ] = useState<boolean>(false)
  const [hasChanges, setHasChanges] = useState<boolean>(false)

  const [historiqueModif, setHistoriqueModif] = useState<
    Modification[] | undefined
  >(evenement && evenement.historique.slice(0, 2))
  const [showPlusHistorique, setShowPlusHistorique] = useState<boolean>(false)

  let initialTracking: string
  if (evenement) initialTracking = `Modification rdv`
  else initialTracking = `Création rdv${idJeune ? ' jeune' : ''}`
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  function handleDelete(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault()
    e.stopPropagation()
    openDeleteRdvModal()
  }

  async function openAgenceModal() {
    if (!agences.length) {
      setAgences(
        await referentielService.getAgencesClientSide(conseiller!.structure)
      )
    }
    setShowAgenceModal(true)
    setTrackingTitle(initialTracking + ' - Pop-in sélection agence')
  }

  async function closeAgenceModal() {
    setShowAgenceModal(false)
    setTrackingTitle(initialTracking)
  }

  function openLeavePageModal() {
    setShowLeavePageModal(true)
    setConfirmBeforeLeaving(false)
    setTrackingTitle(`${initialTracking} - Modale Annulation`)
  }

  function closeLeavePageModal() {
    setShowLeavePageModal(false)
    setConfirmBeforeLeaving(true)
    setTrackingTitle(initialTracking)
  }

  function showConfirmationModal(payload: EvenementFormData) {
    setPayloadForConfirmationModal(payload)
    setTrackingTitle(`${initialTracking} - Modale confirmation modification`)
  }

  function closeConfirmationModal() {
    setPayloadForConfirmationModal(undefined)
    setTrackingTitle(initialTracking)
  }

  function openDeleteRdvModal() {
    setShowDeleteRdvModal(true)
    setTrackingTitle(initialTracking + ' - Modale suppression rdv')
  }

  function closeDeleteRdvModal() {
    setShowDeleteRdvModal(false)
    setTrackingTitle(initialTracking)
  }

  function aDesJeunesDUnAutrePortefeuille(): boolean {
    const fromEvenement = evenement?.jeunes.some(
      ({ id }) => !jeunes.some((jeune) => jeune.id === id)
    )
    return fromEvenement || formHasBeneficiaireAutrePortefeuille
  }

  async function soumettreRendezVous(
    payload: EvenementFormData
  ): Promise<void> {
    setConfirmBeforeLeaving(false)
    if (!evenement) {
      await rendezVousService.creerEvenement(payload)
    } else {
      await rendezVousService.updateRendezVous(evenement.id, payload)
    }

    const { pathname, query } = getCleanUrlObject(returnTo)
    const queryParam = evenement
      ? QueryParam.modificationRdv
      : QueryParam.creationRdv
    await router.push({
      pathname,
      query: setQueryParams(query, { [queryParam]: QueryValue.succes }),
    })
  }

  async function deleteEvenement(): Promise<void> {
    setShowDeleteRdvError(false)
    setShowDeleteRdvModal(false)
    try {
      await rendezVousService.deleteEvenement(evenement!.id)
      const { pathname, query } = getCleanUrlObject(returnTo)
      await router.push({
        pathname,
        query: setQueryParams(query, {
          [QueryParam.suppressionRdv]: QueryValue.succes,
        }),
      })
    } catch (e) {
      setShowDeleteRdvError(true)
    }
  }

  function recupererJeunesDeLEtablissement() {
    if (conseiller?.agence?.id) {
      return jeunesService.getJeunesDeLEtablissement(conseiller.agence.id)
    }
    return Promise.resolve([])
  }

  async function renseignerAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    await conseillerService.modifierAgence(agence)
    setConseiller({ ...conseiller!, agence })
    setTrackingTitle(initialTracking + ' - Succès ajout agence')
    setShowAgenceModal(false)
  }

  function trackContacterSupport() {
    trackEvent({
      structure: conseiller!.structure,
      categorie: 'Contact Support',
      action: 'Pop-in sélection agence',
      nom: '',
    })
  }

  function togglePlusHistorique() {
    const newShowPlusHistorique = !showPlusHistorique
    if (newShowPlusHistorique) setHistoriqueModif(evenement!.historique)
    else setHistoriqueModif(evenement!.historique.slice(0, 2))
    setShowPlusHistorique(newShowPlusHistorique)
  }

  useLeavePageModal(hasChanges && confirmBeforeLeaving, openLeavePageModal)

  useMatomo(trackingTitle)

  return (
    <>
      {showDeleteRdvError && (
        <FailureAlert
          label="Votre événement n'a pas été supprimé, veuillez essayer ultérieurement"
          onAcknowledge={() => setShowDeleteRdvError(false)}
        />
      )}

      {aDesJeunesDUnAutrePortefeuille() && (
        <div className='mb-6'>
          <InformationMessage content='Cet événement concerne des bénéficiaires que vous ne suivez pas et qui ne sont pas dans votre portefeuille' />
        </div>
      )}

      {evenement && (
        <>
          <Button
            style={ButtonStyle.SECONDARY}
            onClick={handleDelete}
            label={`Supprimer l’événement du ${evenement.date}`}
          >
            <IconComponent
              name={IconName.Delete}
              aria-hidden='true'
              focusable='false'
              className='mr-2 w-4 h-4'
            />
            Supprimer
          </Button>

          <dl>
            <div className='mt-6 border border-solid border-grey_100 rounded-medium p-4'>
              <dt className='sr-only'>Type de l’événement</dt>
              <dd className='text-base-bold'>{evenement.type.label}</dd>

              <div className='mt-2'>
                <dt className='inline'>Créé par : </dt>
                <dd className='inline text-s-bold'>
                  {evenement.createur.prenom} {evenement.createur.nom}
                </dd>
              </div>
            </div>

            {historiqueModif && historiqueModif.length > 0 && (
              <div className='mt-4 border border-solid border-grey_100 rounded-medium p-4'>
                <dt className='text-base-bold'>Historique des modifications</dt>
                <dd className='mt-2'>
                  <ul>
                    {historiqueModif.map(({ date, auteur }) => (
                      <li key={date}>
                        {toFrenchFormat(DateTime.fromISO(date), DATETIME_LONG)}{' '}
                        :{' '}
                        <span className='text-s-bold'>
                          {auteur.prenom} {auteur.nom}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {evenement.historique.length > 2 && (
                    <button
                      type='button'
                      onClick={togglePlusHistorique}
                      className='block ml-auto'
                    >
                      Voir {showPlusHistorique ? 'moins' : 'plus'}
                      <IconComponent
                        aria-hidden={true}
                        focusable={false}
                        name={
                          showPlusHistorique
                            ? IconName.ChevronUp
                            : IconName.ChevronDown
                        }
                        className='inline h-4 w-4 fill-primary'
                      />
                    </button>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </>
      )}

      <EditionRdvForm
        jeunesConseiller={jeunes}
        recupererJeunesDeLEtablissement={recupererJeunesDeLEtablissement}
        typesRendezVous={typesRendezVous}
        idJeune={idJeune}
        evenement={evenement}
        redirectTo={returnTo}
        onBeneficiairesDUnAutrePortefeuille={
          setFormHasBeneficiaireAutrePortefeuille
        }
        conseillerIsCreator={
          !evenement || conseiller?.id === evenement.createur.id
        }
        conseiller={conseiller}
        onChanges={setHasChanges}
        soumettreRendezVous={soumettreRendezVous}
        leaveWithChanges={openLeavePageModal}
        showConfirmationModal={showConfirmationModal}
        renseignerAgence={openAgenceModal}
      />

      {showLeavePageModal && (
        <LeavePageConfirmationModal
          message={`Vous allez quitter la ${
            evenement ? 'modification de l’' : 'création d’un nouvel '
          }événement`}
          commentaire={`Toutes les informations ${
            evenement ? 'modifiées' : 'saisies'
          } seront perdues`}
          onCancel={closeLeavePageModal}
          destination={returnTo}
        />
      )}

      {payloadForConfirmationModal && (
        <ConfirmationUpdateRdvModal
          onCancel={closeConfirmationModal}
          onConfirmation={() =>
            soumettreRendezVous(payloadForConfirmationModal)
          }
        />
      )}

      {showDeleteRdvModal && (
        <DeleteRdvModal
          aDesJeunesDUnAutrePortefeuille={aDesJeunesDUnAutrePortefeuille()}
          onClose={closeDeleteRdvModal}
          performDelete={deleteEvenement}
        />
      )}

      {showAgenceModal && agences.length && (
        <RenseignementAgenceModal
          structureConseiller={conseiller!.structure}
          referentielAgences={agences}
          onAgenceChoisie={renseignerAgence}
          onContacterSupport={trackContacterSupport}
          onClose={closeAgenceModal}
        />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<EditionRdvProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  if (user.structure === StructureConseiller.POLE_EMPLOI)
    return {
      redirect: { destination: '/mes-jeunes', permanent: false },
    }

  const jeunesService = withDependance<JeunesService>('jeunesService')
  const rendezVousService =
    withDependance<EvenementsService>('rendezVousService')
  const jeunes = await jeunesService.getJeunesDuConseillerServerSide(
    user.id,
    accessToken
  )

  const typesRendezVous = await rendezVousService.getTypesRendezVous(
    accessToken
  )

  const referer = context.req.headers.referer
  const redirectTo =
    referer && !comingFromHome(referer) ? referer : '/mes-jeunes'
  const props: EditionRdvProps = {
    jeunes: [...jeunes].sort(compareJeunesByNom),
    typesRendezVous: typesRendezVous,
    withoutChat: true,
    returnTo: redirectTo,
    pageTitle: 'Mes événements - Créer',
    pageHeader: 'Créer un nouvel événement',
  }

  const idRdv = context.query.idRdv as string | undefined
  if (idRdv) {
    const evenement = await rendezVousService.getDetailsEvenement(
      idRdv,
      accessToken
    )
    if (!evenement) return { notFound: true }
    props.evenement = evenement
    props.pageTitle = 'Mes événements - Modifier'
    props.pageHeader = 'Modifier l’événement'
  } else if (referer) {
    const regex = /mes-jeunes\/(?<idJeune>[\w-]+)/
    const match = regex.exec(referer)
    if (match?.groups?.idJeune) props.idJeune = match.groups.idJeune
  }

  return { props }
}

export default withTransaction(EditionRdv.name, 'page')(EditionRdv)

function comingFromHome(referer: string): boolean {
  return referer.split('?')[0].endsWith('/index')
}

function getCleanUrlObject(url: string): {
  pathname: string
  query: Record<string, string | string[]>
} {
  const { pathname, query } = parseUrl(url)
  return {
    pathname,
    query: deleteQueryParams(query, [
      QueryParam.modificationRdv,
      QueryParam.creationRdv,
      QueryParam.suppressionRdv,
    ]),
  }
}
