'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useRouter } from 'next/navigation'
import React, { MouseEvent, useRef, useState } from 'react'

import { EditionActionForm } from 'components/action/EditionActionForm'
import Modal from 'components/Modal'
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
  aDesCommentaires: boolean
  idJeune: string
  situationsNonProfessionnelles: SituationNonProfessionnelle[]
  returnTo: string
}

function ModificationPage({
  action,
  actionsPredefinies,
  aDesCommentaires,
  idJeune,
  situationsNonProfessionnelles,
  returnTo,
}: ModificationProps) {
  const router = useRouter()
  const [portefeuille] = usePortefeuille()
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  const [deleteDisabled, setDeleteDisabled] = useState<boolean>(false)
  const [showEchecMessage, setShowEchecMessage] = useState<boolean>(false)
  const [succesModification, setSuccesModification] = useState<boolean>(false)
  const [showSuppression, setShowSuppression] = useState<boolean>(false)

  const initialTracking = 'Actions jeune – Modification'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  const afficherSuppressionAction =
    action.creatorType === UserType.CONSEILLER.toLowerCase() &&
    action.status !== StatutAction.Terminee &&
    !aDesCommentaires

  const [showHelperCategories, setShowHelperCategories] =
    useState<boolean>(false)

  function permuterAffichageHelperCategories() {
    setShowHelperCategories(!showHelperCategories)
  }

  async function soumettreAction(payload: ActionFormData): Promise<void> {
    await modifierAction(payload)
  }

  async function modifierAction(payload: ActionFormData): Promise<void> {
    const { modifierAction: _modifierAction } = await import(
      'services/actions.service'
    )
    await _modifierAction(action.id, payload)

    setTrackingTitle('Actions jeune – Modification succès')
    setSuccesModification(true)
  }

  async function deleteAction(): Promise<void> {
    setDeleteDisabled(true)
    const { deleteAction: _deleteAction } = await import(
      'services/actions.service'
    )
    _deleteAction(action.id)
      .then(() => {
        setTrackingTitle('Actions jeune – Suppression')
        router.push('/mes-jeunes/' + idJeune)
      })
      .catch((error: Error) => {
        setShowEchecMessage(true)
        console.log('Erreur lors de la suppression de l action', error)
      })
      .finally(() => {
        setDeleteDisabled(false)
      })
  }

  useMatomo(trackingTitle, aDesBeneficiaires)

  return (
    <>
      {!succesModification && !showSuppression && (
        <>
          <PageActionsPortal>
            <>
              {afficherSuppressionAction && (
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
                  Supprimer
                </Button>
              )}
            </>
          </PageActionsPortal>

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
            permuterAffichageHelperCategories={
              permuterAffichageHelperCategories
            }
            soumettreAction={soumettreAction}
          />

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
              href={`/mes-jeunes/${idJeune}`}
              style={ButtonStyle.PRIMARY}
            >
              Consulter la liste des actions
            </ButtonLink>
          </div>
        </div>
      )}

      {showSuppression && (
        <div className='text-center'>
          <IllustrationComponent
            name={IllustrationName.Delete}
            className='m-auto fill-warning w-[180px] h-[180px]'
            aria-hidden={true}
            focusable={false}
          />
          <h2 className='text-m-bold mb-2'>Supprimer l’action ?</h2>
          <p>
            Votre choix est définitif. Vous ne pourrez plus la consulter ni la
            modifier.
          </p>
          <div className='mt-10 flex justify-center gap-4'>
            <Button
              onClick={() => setShowSuppression(false)}
              style={ButtonStyle.SECONDARY}
              label={`Annuler la suppression de l’action ${action.content}`}
            >
              Annuler
            </Button>
            <Button
              onClick={() => deleteAction()}
              style={ButtonStyle.PRIMARY}
              label={`Annuler l’action ${action.content}`}
            >
              Supprimer
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default withTransaction(ModificationPage.name, 'page')(ModificationPage)
