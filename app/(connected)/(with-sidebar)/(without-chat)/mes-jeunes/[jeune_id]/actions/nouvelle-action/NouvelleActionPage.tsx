'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React, { MouseEvent, useRef, useState } from 'react'

import { EditionActionForm } from 'components/action/EditionActionForm'
import LeavePageConfirmationModal from 'components/LeavePageConfirmationModal'
import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import {
  ActionPredefinie,
  SituationNonProfessionnelle,
} from 'interfaces/action'
import { ActionFormData } from 'interfaces/json/action'
import useMatomo from 'utils/analytics/useMatomo'
import { useLeavePageModal } from 'utils/hooks/useLeavePageModal'
import { usePortefeuille } from 'utils/portefeuilleContext'

type EditionActionProps = {
  idJeune: string
  categories: SituationNonProfessionnelle[]
  actionsPredefinies: ActionPredefinie[]
  returnTo: string
}

export const TITRE_AUTRE = 'Autre'

function NouvelleActionPage({
  idJeune,
  categories,
  actionsPredefinies,
  returnTo,
}: EditionActionProps) {
  const [portefeuille] = usePortefeuille()

  const [showHelperCategories, setShowHelperCategories] =
    useState<boolean>(false)
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)
  const [succesCreation, setSuccesCreation] = useState<boolean>(false)

  const [showLeavePageModal, setShowLeavePageModal] = useState<boolean>(false)
  const [confirmBeforeLeaving, setConfirmBeforeLeaving] =
    useState<boolean>(true)

  const initialTracking = 'Actions jeune – Création action'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  async function soumettreAction(payload: ActionFormData): Promise<void> {
    setConfirmBeforeLeaving(false)
    await creerAction(payload)
  }

  async function creerAction(action: ActionFormData) {
    setConfirmBeforeLeaving(false)

    const { creerAction: _creerAction } = await import(
      'services/actions.service'
    )
    await _creerAction(action, idJeune)

    setTrackingTitle('Actions jeune – Succès création action')
    setSuccesCreation(true)
  }

  function resetForm() {
    setSuccesCreation(false)
    setTrackingTitle(initialTracking)
  }

  function permuterAffichageHelperCategories() {
    setShowHelperCategories(!showHelperCategories)
  }

  function openLeavePageConfirmationModal() {
    setShowLeavePageModal(true)
    setConfirmBeforeLeaving(false)
  }

  function closeLeavePageConfirmationModal() {
    setShowLeavePageModal(false)
    setConfirmBeforeLeaving(true)
  }

  useLeavePageModal(confirmBeforeLeaving, openLeavePageConfirmationModal)

  useMatomo(trackingTitle, aDesBeneficiaires)

  return (
    <>
      {!succesCreation && (
        <EditionActionForm
          actionsPredefinies={actionsPredefinies}
          categories={categories}
          returnTo={returnTo}
          permuterAffichageHelperCategories={permuterAffichageHelperCategories}
          soumettreAction={soumettreAction}
        />
      )}

      {succesCreation && (
        <div className='text-center'>
          <IllustrationComponent
            name={IllustrationName.Check}
            className='m-auto fill-success_darken w-[180px] h-[180px]'
            aria-hidden={true}
            focusable={false}
          />
          <h2 className='text-m-bold mb-2'>Action enregistrée !</h2>
          <p>
            L’action est en route vers l’application de votre bénéficiaire. De
            votre côté, retrouvez l’action dans la fiche bénéficiaire ou
            l’onglet Pilotage !
          </p>
          <div className='mt-10 flex justify-center gap-4'>
            <Button style={ButtonStyle.SECONDARY} onClick={resetForm}>
              Créer une nouvelle action
            </Button>
            <ButtonLink href={returnTo} style={ButtonStyle.PRIMARY}>
              Consulter la liste des actions
            </ButtonLink>
          </div>
        </div>
      )}

      {showHelperCategories && (
        <Modal
          ref={modalRef}
          title='Pourquoi choisir une catégorie ?'
          titleIllustration={IllustrationName.Info}
          onClose={() => setShowHelperCategories(false)}
        >
          <p>
            Les catégories proposées sont le reflet de celles que vous
            retrouverez lors de la qualification. Elles vous permettent de
            gagner du temps.
          </p>
          <Button
            style={ButtonStyle.PRIMARY}
            onClick={(e) => modalRef.current!.closeModal(e)}
            className='block m-auto mt-4'
          >
            Fermer
          </Button>
        </Modal>
      )}

      {showLeavePageModal && (
        <LeavePageConfirmationModal
          titre={`Souhaitez-vous quitter la création de l’action ?`}
          commentaire='Les informations saisies seront perdues.'
          onCancel={closeLeavePageConfirmationModal}
          destination={returnTo}
        />
      )}
    </>
  )
}

export default withTransaction(
  NouvelleActionPage.name,
  'page'
)(NouvelleActionPage)
