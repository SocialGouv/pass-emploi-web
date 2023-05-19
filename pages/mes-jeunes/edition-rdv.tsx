import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import PageActionsPortal from 'components/PageActionsPortal'
import { EditionRdvForm } from 'components/rdv/EditionRdvForm'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { estUserPoleEmploi } from 'interfaces/conseiller'
import {
  estAClore,
  estClos,
  estCreeParSiMILO,
  Evenement,
  isCodeTypeAnimationCollective,
  Modification,
} from 'interfaces/evenement'
import { EvenementFormData } from 'interfaces/json/evenement'
import { PageProps } from 'interfaces/pageProps'
import {
  isTypeAnimationCollective,
  TypeEvenementReferentiel,
} from 'interfaces/referentiel'
import { AlerteParam } from 'referentiel/alerteParam'
import {
  creerEvenement,
  getDetailsEvenement,
  getTypesRendezVous,
  supprimerEvenement as _supprimerEvenement,
  updateRendezVous,
} from 'services/evenements.service'
import { getJeunesDeLEtablissement } from 'services/jeunes.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { DATETIME_LONG, toFrenchFormat } from 'utils/date'
import { useLeavePageModal } from 'utils/hooks/useLeavePageModal'
import { usePortefeuille } from 'utils/portefeuilleContext'
import redirectedFromHome from 'utils/redirectedFromHome'

const ConfirmationUpdateRdvModal = dynamic(
  import('components/ConfirmationUpdateRdvModal'),
  { ssr: false }
)
const LeavePageConfirmationModal = dynamic(
  import('components/LeavePageConfirmationModal'),
  { ssr: false }
)
const DeleteRdvModal = dynamic(import('components/rdv/DeleteRdvModal'), {
  ssr: false,
})

interface EditionRdvProps extends PageProps {
  typesRendezVous: TypeEvenementReferentiel[]
  returnTo: string
  idJeune?: string
  evenement?: Evenement
  evenementTypeAC?: boolean
}

function EditionRdv({
  typesRendezVous,
  idJeune,
  returnTo,
  evenement,
  evenementTypeAC,
}: EditionRdvProps) {
  const router = useRouter()
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const [_, setAlerte] = useAlerte()

  const aUnBeneficiaireInscritALEvenement: boolean =
    Boolean(evenement) &&
    evenement!.jeunes.some((jeuneEvenement) =>
      portefeuille.some(
        (jeuneConseiller) => jeuneConseiller.id === jeuneEvenement.id
      )
    )
  const conseillerEstObservateur =
    !evenementTypeAC && !aUnBeneficiaireInscritALEvenement

  const lectureSeule =
    evenement &&
    (conseillerEstObservateur ||
      estCreeParSiMILO(evenement) ||
      estClos(evenement))

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
  if (evenement) {
    initialTracking = `Modification${
      evenementTypeAC ? ' animation collective' : ' rdv'
    } ${conseillerEstObservateur ? ' - hors portefeuille' : ''}`
  } else
    initialTracking = `Création ${
      evenementTypeAC ? 'animation collective' : 'rdv'
    } ${idJeune ? ' jeune' : ''} `
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

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
    setTrackingTitle(
      initialTracking +
        ` - Modale suppression ${
          evenementTypeAC ? 'animation collective' : 'rdv'
        }`
    )
  }

  function closeDeleteRdvModal() {
    setShowDeleteRdvModal(false)
    setTrackingTitle(initialTracking)
  }

  function aDesJeunesDUnAutrePortefeuille(): boolean {
    if (conseillerEstObservateur) return true

    const fromEvenement = evenement?.jeunes.some(
      ({ id }) => !portefeuille.some((jeune) => jeune.id === id)
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
    const idNouvelEvenement = await creerEvenement(payload)
    const alertType = evenementTypeAC
      ? AlerteParam.creationAnimationCollective
      : AlerteParam.creationRDV
    setAlerte(alertType, idNouvelEvenement)
  }

  async function modifierEvenement(
    idEvenement: string,
    payload: EvenementFormData
  ): Promise<void> {
    await updateRendezVous(idEvenement, payload)
    const alertType = evenementTypeAC
      ? AlerteParam.modificationAnimationCollective
      : AlerteParam.modificationRDV
    setAlerte(alertType)
  }

  async function supprimerEvenement(): Promise<void> {
    setShowDeleteRdvError(false)
    setShowDeleteRdvModal(false)

    try {
      await _supprimerEvenement(evenement!.id)
      const alertType = evenementTypeAC
        ? AlerteParam.suppressionAnimationCollective
        : AlerteParam.suppressionRDV
      setAlerte(alertType)
      await router.push(returnTo)
    } catch (e) {
      setShowDeleteRdvError(true)
    }
  }

  function recupererJeunesDeLEtablissement() {
    if (conseiller.agence?.id) {
      return getJeunesDeLEtablissement(conseiller.agence.id)
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

  useMatomo(trackingTitle, aDesBeneficiaires)

  return (
    <>
      <PageActionsPortal>
        <>
          {evenement && !lectureSeule && (
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
          )}

          {evenement && estAClore(evenement) && (
            <ButtonLink
              style={ButtonStyle.PRIMARY}
              href={`/evenements/${
                evenement.id
              }/cloture?redirectUrl=${encodeURIComponent(
                returnTo + '?onglet=etablissement'
              )}`}
            >
              <IconComponent
                name={IconName.Description}
                aria-hidden={true}
                focusable={false}
                className='mr-2 w-4 h-4'
              />
              Clore
            </ButtonLink>
          )}
        </>
      </PageActionsPortal>

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

      {evenement && conseillerEstObservateur && (
        <div className='mb-6'>
          <InformationMessage label='Vous êtes en lecture seule'>
            Vous pouvez uniquement lire le détail de ce rendez-vous car aucun
            bénéficiaire de votre portefeuille n’y est inscrit.
          </InformationMessage>
        </div>
      )}

      {!conseillerEstObservateur && aDesJeunesDUnAutrePortefeuille() && (
        <div className='mb-6'>
          <InformationMessage label='Cet événement concerne des bénéficiaires que vous ne suivez pas et qui ne sont pas dans votre portefeuille' />
        </div>
      )}

      {evenement && (
        <>
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
                <dt className='inline'>Créé(e) par :</dt>
                <dd className='inline text-s-bold'>
                  {estCreeParSiMILO(evenement) && 'Système d’information MILO'}
                  {!estCreeParSiMILO(evenement) &&
                    `${evenement.createur.prenom}  ${evenement.createur.nom}`}
                </dd>
              </div>
            </div>

            {!estCreeParSiMILO(evenement) &&
              Boolean(historiqueModif?.length) && (
                <div className='mt-4 border border-solid border-grey_100 rounded-base p-4'>
                  <dt className='text-base-bold'>
                    Historique des modifications
                  </dt>
                  <dd className='mt-2'>
                    <ul>
                      {historiqueModif!.map(({ date, auteur }) => (
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
        jeunesConseiller={portefeuille}
        recupererJeunesDeLEtablissement={recupererJeunesDeLEtablissement}
        typesRendezVous={typesRendezVous}
        idJeune={idJeune}
        evenement={evenement}
        redirectTo={returnTo}
        conseiller={conseiller}
        conseillerIsCreator={
          !evenement || conseiller.id === evenement.createur.id
        }
        evenementTypeAC={evenementTypeAC}
        lectureSeule={lectureSeule}
        onBeneficiairesDUnAutrePortefeuille={
          setFormHasBeneficiaireAutrePortefeuille
        }
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
          evenementTypeAC={evenementTypeAC!}
        />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<EditionRdvProps> = async (
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
    session: { user, accessToken },
  } = sessionOrRedirect
  if (estUserPoleEmploi(user))
    return {
      redirect: { destination: '/mes-jeunes', permanent: false },
    }

  let redirectTo = context.query.redirectUrl as string
  if (!redirectTo) {
    const referer = context.req.headers.referer
    redirectTo =
      referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes'
  }

  const idRdv = context.query.idRdv as string | undefined
  if (idRdv) {
    const evenement = await getDetailsEvenement(idRdv, accessToken)
    if (!evenement) return { notFound: true }

    return {
      props: {
        returnTo: redirectTo,
        ...buildPropsModificationEvenement(evenement),
      },
    }
  } else {
    const typesEvenements = await getTypesRendezVous(accessToken)
    const creationAC = context.query.type === 'ac'

    return {
      props: {
        returnTo: redirectTo,
        ...buildPropsCreationEvenement(
          typesEvenements,
          creationAC,
          context.query.idJeune as string | undefined
        ),
      },
    }
  }
}

export default withTransaction(EditionRdv.name, 'page')(EditionRdv)

function buildPropsModificationEvenement(
  evenement: Evenement
): Omit<EditionRdvProps, 'returnTo'> {
  const estUneAC = isCodeTypeAnimationCollective(evenement.type.code)

  return {
    evenement,
    typesRendezVous: [],
    evenementTypeAC: estUneAC,
    withoutChat: true,
    pageTitle: 'Mes événements - Modifier',
    pageHeader: estUneAC
      ? 'Détail de l’animation collective'
      : 'Détail du rendez-vous',
  }
}

function buildPropsCreationEvenement(
  typesEvenements: TypeEvenementReferentiel[],
  creationAC: boolean,
  idJeune?: string
): Omit<EditionRdvProps, 'returnTo'> {
  const typesRdvCEJ: TypeEvenementReferentiel[] = []
  const typesRdvAC: TypeEvenementReferentiel[] = []
  typesEvenements.forEach((t) => {
    if (isTypeAnimationCollective(t)) typesRdvAC.push(t)
    else typesRdvCEJ.push(t)
  })

  const props: Omit<EditionRdvProps, 'returnTo'> = {
    typesRendezVous: creationAC ? typesRdvAC : typesRdvCEJ,
    withoutChat: true,
    evenementTypeAC: creationAC,
    pageTitle: creationAC
      ? 'Mes événements - Créer une animation collective'
      : 'Mes événements - Créer un rendez-vous',
    pageHeader: creationAC
      ? 'Créer une animation collective'
      : 'Créer un rendez-vous',
  }

  if (idJeune) props.idJeune = idJeune

  return props
}
