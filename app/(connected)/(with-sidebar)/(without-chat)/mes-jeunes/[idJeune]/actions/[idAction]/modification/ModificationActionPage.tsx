'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'

import { EditionActionForm } from 'components/action/EditionActionForm'
import Modal, { ModalHandles } from 'components/Modal'
import PageActionsPortal from 'components/PageActionsPortal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import {
  Action,
  ActionPredefinie,
  SituationNonProfessionnelle,
  StatutAction,
} from 'interfaces/action'
import { UserType } from 'interfaces/conseiller'
import { ActionFormData } from 'interfaces/json/action'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

type ModificationProps = {
  action: Action
  actionsPredefinies: ActionPredefinie[]
  idBeneficiaire: string
  situationsNonProfessionnelles: SituationNonProfessionnelle[]
  returnTo: string
}

function ModificationPage({
  action,
  actionsPredefinies,
  idBeneficiaire,
  situationsNonProfessionnelles,
  returnTo,
}: ModificationProps) {
  const router = useRouter()
  const [portefeuille] = usePortefeuille()

  const [deleteDisabled, setDeleteDisabled] = useState<boolean>(false)
  const [showEchecMessage, setShowEchecMessage] = useState<boolean>(false)
  const [succesModification, setSuccesModification] = useState<boolean>(false)
  const [showSuppression, setShowSuppression] = useState<boolean>(false)

  const initialTracking = 'Actions jeune – Modification'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)
  const afficherSuppressionAction =
    action.creatorType === UserType.CONSEILLER.toLowerCase() &&
    action.status !== StatutAction.Terminee &&
    action.status !== StatutAction.Qualifiee

  const suppressionModalRef = useRef<ModalHandles>(null)

  async function modifierAction(payload: ActionFormData): Promise<void> {
    const { modifierAction: _modifierAction } = await import(
      'server-actions/actions.server-actions'
    )
    await _modifierAction(action.id, payload)

    setTrackingTitle('Actions jeune – Modification succès')
    setSuccesModification(true)
  }

  async function supprimerAction(): Promise<void> {
    setDeleteDisabled(true)
    const { deleteAction } = await import('services/actions.service')
    try {
      await deleteAction(action.id)
      setTrackingTitle('Actions jeune – Suppression')
      router.push('/mes-jeunes/' + idBeneficiaire)
    } catch (error) {
      setShowEchecMessage(true)
      console.log('Erreur lors de la suppression de l action', error)
    } finally {
      setDeleteDisabled(false)
    }
  }

  useMatomo(trackingTitle, portefeuille.length > 0)

  return (
    <>
      {!succesModification && !showSuppression && (
        <>
          {afficherSuppressionAction && (
            <PageActionsPortal>
              <Button
                label="Supprimer l'action"
                onClick={() => setShowSuppression(true)}
                style={ButtonStyle.WARNING}
                disabled={deleteDisabled}
              >
                <IconComponent
                  name={IconName.Delete}
                  aria-hidden={true}
                  focusable={false}
                  className='w-4 h-4 mr-2'
                />
                Supprimer l’action
              </Button>
            </PageActionsPortal>
          )}

          {showEchecMessage && (
            <FailureAlert
              label="Une erreur s'est produite, veuillez réessayer ultérieurement"
              onAcknowledge={() => setShowEchecMessage(false)}
            />
          )}

          <EditionActionForm
            action={action}
            actionsPredefinies={actionsPredefinies}
            categories={situationsNonProfessionnelles}
            returnTo={returnTo}
            soumettreAction={modifierAction}
          />
        </>
      )}

      {succesModification && (
        <div className='text-center'>
          <IllustrationComponent
            name={IllustrationName.Check}
            className='m-auto fill-success_darken w-[180px] h-[180px]'
            aria-hidden={true}
            focusable={false}
          />
          <h2 className='text-m-bold mb-2'>Modifications enregistrées</h2>
          <p>
            Vous pouvez poursuivre votre travail : qualifiez l’action ou revenez
            à la liste d’actions.
          </p>
          <div className='mt-10 flex justify-center gap-4'>
            <ButtonLink
              href={`/mes-jeunes/${idBeneficiaire}?onglet=actions`}
              style={ButtonStyle.PRIMARY}
            >
              Consulter la liste des actions
            </ButtonLink>
          </div>
        </div>
      )}

      {showSuppression && (
        <Modal
          ref={suppressionModalRef}
          title='Supprimer l’action ?'
          titleIllustration={IllustrationName.Delete}
          onClose={() => setShowSuppression(false)}
        >
          <p>
            Votre choix est définitif. Vous ne pourrez plus la consulter ni la
            modifier.
          </p>
          <div className='mt-10 flex justify-center gap-4'>
            <Button
              onClick={(e) => suppressionModalRef.current!.closeModal(e)}
              style={ButtonStyle.SECONDARY}
              label={`Annuler la suppression de l’action ${action.titre}`}
            >
              Annuler
            </Button>
            <Button
              onClick={() => supprimerAction()}
              style={ButtonStyle.PRIMARY}
              label={`Supprimer l’action ${action.titre}`}
            >
              Supprimer
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default withTransaction(ModificationPage.name, 'page')(ModificationPage)
