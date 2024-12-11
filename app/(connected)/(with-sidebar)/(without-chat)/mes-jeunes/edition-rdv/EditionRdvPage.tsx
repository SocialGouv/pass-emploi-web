'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import PageActionsPortal from 'components/PageActionsPortal'
import { EditionRdvForm } from 'components/rdv/EditionRdvForm'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import {
  estAClore,
  estCreeParSiMILO,
  Evenement,
  Modification,
} from 'interfaces/evenement'
import { EvenementFormData } from 'interfaces/json/evenement'
import { TypeEvenementReferentiel } from 'interfaces/referentiel'
import { AlerteParam } from 'referentiel/alerteParam'
import { getBeneficiairesDeLEtablissementClientSide } from 'services/beneficiaires.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toFrenchDateTime } from 'utils/date'
import { useConfirmBeforeLeaving } from 'utils/hooks/useConfirmBeforeLeaving'
import { usePortefeuille } from 'utils/portefeuilleContext'

const ConfirmationUpdateRdvModal = dynamic(
  () => import('components/ConfirmationUpdateRdvModal'),
  { ssr: false }
)
const LeavePageConfirmationModal = dynamic(
  () => import('components/LeavePageConfirmationModal'),
  { ssr: false }
)
const DeleteRdvModal = dynamic(() => import('components/rdv/DeleteRdvModal'), {
  ssr: false,
})

export type EditionRdvProps = {
  conseillerEstObservateur: boolean
  lectureSeule: boolean
  returnTo: string
  typesRendezVous: TypeEvenementReferentiel[]
  idBeneficiaire?: string
  evenement?: Evenement
  evenementTypeAC?: boolean
}

function EditionRdvPage({
  conseillerEstObservateur,
  lectureSeule,
  returnTo,
  typesRendezVous,
  idBeneficiaire,
  evenement,
  evenementTypeAC,
}: EditionRdvProps) {
  const router = useRouter()
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
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

  let initialTracking: string
  if (evenement) {
    initialTracking = `Modification${
      evenementTypeAC ? ' animation collective' : ' rdv'
    } ${conseillerEstObservateur ? ' - hors portefeuille' : ''}`
  } else
    initialTracking = `Création ${
      evenementTypeAC ? 'animation collective' : 'rdv'
    } ${idBeneficiaire ? ' jeune' : ''} `
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)
  const aDesBeneficiaires = portefeuille.length > 0

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

  function aDesBeneficiaireDUnAutrePortefeuille(): boolean {
    if (conseillerEstObservateur) return true

    const fromEvenement = evenement?.jeunes.some(
      ({ id }) => !portefeuille.some((beneficiaire) => beneficiaire.id === id)
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
    router.push(returnTo)
    router.refresh()
  }

  async function creerNouvelEvenement(
    payload: EvenementFormData
  ): Promise<void> {
    const { creerEvenement } = await import('services/evenements.service')
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
    const { updateRendezVous } = await import('services/evenements.service')
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
      const { supprimerEvenement: _supprimerEvenement } = await import(
        'services/evenements.service'
      )
      await _supprimerEvenement(evenement!.id)
      const alertType = evenementTypeAC
        ? AlerteParam.suppressionAnimationCollective
        : AlerteParam.suppressionRDV
      setAlerte(alertType)
      router.push(returnTo)
    } catch {
      setShowDeleteRdvError(true)
    }
  }

  function recupererBeneficiairesDeLEtablissement() {
    if (conseiller.agence?.id) {
      return getBeneficiairesDeLEtablissementClientSide(conseiller.agence.id)
    }
    return Promise.resolve([])
  }

  function togglePlusHistorique() {
    const newShowPlusHistorique = !showPlusHistorique
    if (newShowPlusHistorique) setHistoriqueModif(evenement!.historique)
    else setHistoriqueModif(evenement!.historique.slice(0, 2))
    setShowPlusHistorique(newShowPlusHistorique)
  }

  useConfirmBeforeLeaving(hasChanges && confirmBeforeLeaving)

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
                aria-hidden={true}
                focusable={false}
                className='mr-2 w-4 h-4'
              />
              Supprimer
            </Button>
          )}

          {evenement && estAClore(evenement) && evenement.jeunes.length > 0 && (
            <ButtonLink
              style={ButtonStyle.PRIMARY}
              href={`/evenements/${
                evenement.id
              }/cloture?redirectUrl=${encodeURIComponent(returnTo)}`}
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

      {!conseillerEstObservateur && aDesBeneficiaireDUnAutrePortefeuille() && (
        <div className='mb-6'>
          <InformationMessage label='Cet événement concerne des bénéficiaires que vous ne suivez pas et qui ne sont pas dans votre portefeuille' />
        </div>
      )}

      {evenement && (
        <>
          {estAClore(evenement) && evenement.jeunes.length > 0 && (
            <div className='pt-6'>
              <FailureAlert label='Cet événement est passé et doit être clos' />
            </div>
          )}
          {estAClore(evenement) && !evenement.jeunes.length && (
            <div className='pt-6'>
              <FailureAlert label='Cet événement est passé et doit être supprimé' />
            </div>
          )}

          <dl>
            <div className='mt-6 border border-solid border-grey_100 rounded-base p-4'>
              <dt className='sr-only'>Type de l’événement</dt>
              <dd className='text-base-bold mb-2'>{evenement.type.label}</dd>

              <dt className='inline mt-2'>Créé(e) par : </dt>
              <dd className='inline text-s-bold'>
                {estCreeParSiMILO(evenement) && 'Système d’information MILO'}
                {!estCreeParSiMILO(evenement) &&
                  `${evenement.createur.prenom}  ${evenement.createur.nom}`}
              </dd>
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
                          <span
                            aria-label={toFrenchDateTime(date, { a11y: true })}
                          >
                            {toFrenchDateTime(date)}
                          </span>{' '}
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
        beneficiairesConseiller={portefeuille}
        recupererBeneficiairesDeLEtablissement={
          recupererBeneficiairesDeLEtablissement
        }
        typesRendezVous={typesRendezVous}
        idBeneficiaire={idBeneficiaire}
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
          titre={`Souhaitez-vous quitter la ${
            evenement ? 'modification de l’' : 'création de l’'
          }${evenementTypeAC ? 'animation collective' : 'événement'} ?`}
          commentaire='Les informations saisies seront perdues.'
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
          aDesBeneficiairesDUnAutrePortefeuille={aDesBeneficiaireDUnAutrePortefeuille()}
          onClose={closeDeleteRdvModal}
          performDelete={supprimerEvenement}
          evenementTypeAC={evenementTypeAC!}
          titreEvenement={evenement!.titre}
        />
      )}
    </>
  )
}

export default withTransaction(EditionRdvPage.name, 'page')(EditionRdvPage)
