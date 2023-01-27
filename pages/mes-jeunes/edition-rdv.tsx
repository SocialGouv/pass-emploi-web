import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import ConfirmationUpdateRdvModal from 'components/ConfirmationUpdateRdvModal'
import LeavePageConfirmationModal from 'components/LeavePageConfirmationModal'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import { EditionRdvForm } from 'components/rdv/EditionRdvForm'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  estAClore,
  estClos,
  estCreeParSiMILO,
  Evenement,
  isCodeTypeAnimationCollective,
  Modification,
  TypeEvenement,
} from 'interfaces/evenement'
import { BaseJeune, compareJeunesByNom } from 'interfaces/jeune'
import { EvenementFormData } from 'interfaces/json/evenement'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { EvenementsService } from 'services/evenements.service'
import { JeunesService } from 'services/jeunes.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { DATETIME_LONG, toFrenchFormat } from 'utils/date'
import { useLeavePageModal } from 'utils/hooks/useLeavePageModal'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

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
  const evenementsService =
    useDependance<EvenementsService>('evenementsService')
  const [conseiller] = useConseiller()

  const [_, setAlerte] = useAlerte()

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

  const estUneAc = returnTo.includes('etablissement')

  let initialTracking: string
  if (evenement)
    initialTracking = `Modification ${
      isCodeTypeAnimationCollective(evenement.type.code)
        ? 'animation collective'
        : 'rdv'
    }`
  else
    initialTracking = `Création ${estUneAc ? 'animation collective' : 'rdv'} ${
      idJeune ? ' jeune' : ''
    }`
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  function handleDelete(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault()
    e.stopPropagation()
    openDeleteRdvModal()
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

  async function soumettreEvenement(payload: EvenementFormData): Promise<void> {
    setConfirmBeforeLeaving(false)
    if (!evenement) {
      await creerNouvelEvenement(payload)
    } else {
      await modifierEvenement(evenement.id, payload)
    }
    await router.push(returnTo)
  }

  async function creerNouvelEvenement(
    payload: EvenementFormData
  ): Promise<void> {
    const idNouvelEvenement = await evenementsService.creerEvenement(payload)
    setAlerte(AlerteParam.creationEvenement, idNouvelEvenement)
  }

  async function modifierEvenement(
    idEvenement: string,
    payload: EvenementFormData
  ): Promise<void> {
    await evenementsService.updateRendezVous(idEvenement, payload)
    setAlerte(AlerteParam.modificationEvenement)
  }

  async function supprimerEvenement(): Promise<void> {
    setShowDeleteRdvError(false)
    setShowDeleteRdvModal(false)

    try {
      await evenementsService.supprimerEvenement(evenement!.id)
      setAlerte(AlerteParam.suppressionEvenement)
      await router.push(returnTo)
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

  function togglePlusHistorique() {
    const newShowPlusHistorique = !showPlusHistorique
    if (newShowPlusHistorique) setHistoriqueModif(evenement!.historique)
    else setHistoriqueModif(evenement!.historique.slice(0, 2))
    setShowPlusHistorique(newShowPlusHistorique)
  }

  useLeavePageModal(hasChanges && confirmBeforeLeaving, openLeavePageModal)

  useMatomo(trackingTitle)

  const typesRdvCej = [...typesRendezVous].filter(
    (t) => t.categorie === 'CEJ_RDV'
  )
  const typesAC = [...typesRendezVous].filter((t) => t.categorie === 'CEJ_AC')

  return (
    <>
      {showDeleteRdvError && (
        <FailureAlert
          label="Votre événement n'a pas été supprimé, veuillez essayer ultérieurement"
          onAcknowledge={() => setShowDeleteRdvError(false)}
        />
      )}

      {evenement && estCreeParSiMILO(evenement) && (
        <div className='mb-6'>
          <InformationMessage label='Pour modifier cet événement vous devez vous rendre dans le système d’information iMilo, il sera ensuite mis à jour dans la demi-heure' />
        </div>
      )}

      {aDesJeunesDUnAutrePortefeuille() && (
        <div className='mb-6'>
          <InformationMessage label='Cet événement concerne des bénéficiaires que vous ne suivez pas et qui ne sont pas dans votre portefeuille' />
        </div>
      )}

      {evenement && (
        <>
          <div className='flex'>
            {!estClos(evenement) && !estCreeParSiMILO(evenement) && (
              <Button
                style={ButtonStyle.SECONDARY}
                onClick={handleDelete}
                label={`Supprimer l’événement du ${evenement.date}`}
                className='min-w-fit w-1/4'
              >
                <IconComponent
                  name={IconName.Trashcan}
                  aria-hidden='true'
                  focusable='false'
                  className='mr-2 w-4 h-4'
                />
                Supprimer
              </Button>
            )}

            {estAClore(evenement) && (
              <ButtonLink
                style={ButtonStyle.PRIMARY}
                href={`/evenements/${
                  evenement.id
                }/cloture?redirectUrl=${encodeURIComponent(
                  returnTo + '?onglet=etablissement'
                )}`}
                className='ml-6 min-w-fit w-1/4'
              >
                <IconComponent
                  name={IconName.Clipboard}
                  aria-hidden={true}
                  focusable={false}
                  className='mr-2 w-4 h-4'
                />
                Clore
              </ButtonLink>
            )}
          </div>

          {estAClore(evenement) && (
            <div className='pt-6'>
              <FailureAlert label='Cet événement est passé et doit être clos' />
            </div>
          )}

          <dl>
            <div className='mt-6 border border-solid border-grey_100 rounded-base p-4'>
              <dt className='sr-only'>Type de l’événement</dt>
              <dd className='text-base-bold'>{evenement.type.label}</dd>

              <div className='mt-2'>
                <dt className='inline'>Créé(e) par : </dt>
                <dd className='inline text-s-bold'>
                  {estCreeParSiMILO(evenement) && 'Système d’information MILO'}
                  {!estCreeParSiMILO(evenement) &&
                    `${evenement.createur.prenom}  ${evenement.createur.nom}`}
                </dd>
              </div>
            </div>

            {!estCreeParSiMILO(evenement) &&
              historiqueModif &&
              historiqueModif.length > 0 && (
                <div className='mt-4 border border-solid border-grey_100 rounded-base p-4'>
                  <dt className='text-base-bold'>
                    Historique des modifications
                  </dt>
                  <dd className='mt-2'>
                    <ul>
                      {historiqueModif.map(({ date, auteur }) => (
                        <li key={date}>
                          {toFrenchFormat(
                            DateTime.fromISO(date),
                            DATETIME_LONG
                          )}{' '}
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
        typesRendezVous={estUneAc ? typesAC : typesRdvCej}
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
        soumettreRendezVous={soumettreEvenement}
        leaveWithChanges={openLeavePageModal}
        showConfirmationModal={showConfirmationModal}
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
          onConfirmation={() => soumettreEvenement(payloadForConfirmationModal)}
        />
      )}

      {showDeleteRdvModal && (
        <DeleteRdvModal
          aDesJeunesDUnAutrePortefeuille={aDesJeunesDUnAutrePortefeuille()}
          onClose={closeDeleteRdvModal}
          performDelete={supprimerEvenement}
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
  const evenementsService =
    withDependance<EvenementsService>('evenementsService')
  const jeunes = await jeunesService.getJeunesDuConseillerServerSide(
    user.id,
    accessToken
  )

  const typesRendezVous = await evenementsService.getTypesRendezVous(
    accessToken
  )

  let redirectTo = context.query.redirectUrl as string
  if (!redirectTo) {
    const referer = context.req.headers.referer
    redirectTo = referer && !comingFromHome(referer) ? referer : '/mes-jeunes'
  }

  const props: EditionRdvProps = {
    jeunes: [...jeunes].sort(compareJeunesByNom),
    typesRendezVous: typesRendezVous,
    withoutChat: true,
    returnTo: redirectTo,
    pageTitle: `Mes événements - Créer ${
      context.query.type ? 'une animation collective' : 'un rendez-vous'
    }`,
    pageHeader: `${
      context.query.type
        ? 'Créer une animation collective'
        : 'Créer un rendez-vous'
    }`,
  }

  const idRdv = context.query.idRdv as string | undefined
  const idJeune = context.query.idJeune as string | undefined
  if (idRdv) {
    const evenement = await evenementsService.getDetailsEvenement(
      idRdv,
      accessToken
    )
    if (!evenement) return { notFound: true }
    props.evenement = evenement
    props.pageTitle = 'Mes événements - Modifier'
    props.pageHeader = `${
      context.query.type || isCodeTypeAnimationCollective(evenement.type.code)
        ? 'Détail de l’animation collective'
        : 'Détail du rendez-vous'
    }`
  } else if (idJeune) {
    props.idJeune = idJeune
  }

  return { props }
}

export default withTransaction(EditionRdv.name, 'page')(EditionRdv)

function comingFromHome(referer: string): boolean {
  return referer.split('?')[0].endsWith('/index')
}
