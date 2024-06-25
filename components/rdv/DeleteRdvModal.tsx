import React from 'react'

import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'

interface DeleteRdvModalProps {
  aDesJeunesDUnAutrePortefeuille: boolean
  onClose: () => void
  performDelete: () => Promise<void>
  evenementTypeAC: boolean
  titreEvenement: string
}

export default function DeleteRdvModal({
  aDesJeunesDUnAutrePortefeuille,
  onClose,
  performDelete,
  evenementTypeAC,
  titreEvenement,
}: DeleteRdvModalProps) {
  function handleCloseModal() {
    onClose()
  }

  return (
    <Modal
      title={`Souhaitez vous supprimer l’${
        evenementTypeAC ? 'animation collective' : 'événement'
      } : ${titreEvenement} ?`}
      onClose={handleCloseModal}
      titleIllustration={IllustrationName.Delete}
    >
      {aDesJeunesDUnAutrePortefeuille && (
        <>
          <div className='mb-6'>
            <InformationMessage
              iconName={IconName.Info}
              label='Celle-ci concerne des bénéficiaires qui ne sont pas dans votre portefeuille.'
            />
          </div>
          <div className='text-base-regular text-content_color text-center mt-6'>
            <p>
              Le créateur de l’
              {evenementTypeAC ? 'animation collective' : 'événement'} et les
              bénéficiaires seront notifiés de la suppression.
            </p>
          </div>
        </>
      )}

      {!aDesJeunesDUnAutrePortefeuille && (
        <div className='text-base-regular text-content_color text-center mt-6'>
          <p>Les bénéficiaires seront notifiées de la suppression.</p>
        </div>
      )}

      <div className='flex justify-center mt-4'>
        <Button
          type='button'
          className='mr-[16px]'
          style={ButtonStyle.SECONDARY}
          onClick={handleCloseModal}
        >
          <span className='px-[40px]'>Annuler</span>
        </Button>

        <Button
          type='button'
          style={ButtonStyle.PRIMARY}
          onClick={performDelete}
        >
          <span className='px-[40px]'>
            Supprimer l’{evenementTypeAC ? 'animation' : 'événement'}
          </span>
        </Button>
      </div>
    </Modal>
  )
}
