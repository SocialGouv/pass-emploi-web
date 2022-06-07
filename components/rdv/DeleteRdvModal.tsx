import WarningIcon from 'assets/icons/warning.svg'
import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button'

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
    ? 'Vous allez supprimer un rendez-vous qui concerne des jeunes qui ne sont pas dans votre portefeuille'
    : 'L’ensemble des bénéficiaires sera notifié de la suppression'

  return (
    <Modal title='Suppression du rendez-vous' onClose={handleCloseModal}>
      <WarningIcon
        focusable={false}
        aria-hidden={true}
        className='w-[100px] h-[91px] m-auto mb-16 fill-primary'
      />

      <p className='text-base-medium text-content_color text-center mx-28'>
        {message}
      </p>

      {aDesJeunesDUnAutrePortefeuille && (
        <p className='text-base-regular text-content_color text-center mx-28 mt-12'>
          Le créateur et les bénéficiaires recevront un email de suppression du
          rendez-vous.
        </p>
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
