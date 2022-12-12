import IconComponent, { IconName } from '../ui/IconComponent'

import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'

interface DeleteRdvModalProps {
  aDesJeunesDUnAutrePortefeuille: boolean
  onClose: () => void
  performDelete: () => Promise<void>
}

export default function DeleteRdvModal({
  aDesJeunesDUnAutrePortefeuille,
  onClose,
  performDelete,
}: DeleteRdvModalProps) {
  function handleCloseModal() {
    onClose()
  }

  const message = aDesJeunesDUnAutrePortefeuille
    ? 'Vous allez supprimer un événement qui concerne des jeunes qui ne sont pas dans votre portefeuille'
    : 'L’ensemble des bénéficiaires sera notifié de la suppression'

  return (
    <Modal title='Suppression de l’événement' onClose={handleCloseModal}>
      <IconComponent
        name={IconName.Warning}
        focusable={false}
        aria-hidden={true}
        className='w-[108px] h-[108px] m-auto mb-16 fill-primary'
      />

      <p className='text-base-bold text-content_color text-center mx-28'>
        {message}
      </p>

      {aDesJeunesDUnAutrePortefeuille && (
        <div className='text-base-regular text-content_color text-center mx-28 mt-12'>
          <p>Le créateur recevra un email de suppression de l’événement.</p>
          <p>Les bénéficiaires seront notifiés sur l’application CEJ.</p>
        </div>
      )}

      <div className='flex justify-center mt-12'>
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
          <span className='px-[40px]'>Confirmer</span>
        </Button>
      </div>
    </Modal>
  )
}
