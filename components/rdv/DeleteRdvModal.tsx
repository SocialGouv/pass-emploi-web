import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button'

interface DeleteRdvModalProps {
  onClose: () => void
  performDelete: () => Promise<void>
}

export default function DeleteRdvModal({
  onClose,
  performDelete,
}: DeleteRdvModalProps) {
  function handleCloseModal() {
    onClose()
  }

  return (
    <Modal
      title='Vous allez supprimer un rendez-vous'
      onClose={handleCloseModal}
      customHeight='300px'
      customWidth='800px'
    >
      <p className='text-md text-primary_darken mb-[48px]'>
        L’ensemble des bénéficiaires sera notifié de la suppression
      </p>

      <div className='flex'>
        <Button
          type='button'
          className='mr-[16px]'
          style={ButtonStyle.WARNING}
          onClick={performDelete}
        >
          <span className='px-[40px]'>Supprimer</span>
        </Button>

        <Button
          type='button'
          style={ButtonStyle.SECONDARY}
          onClick={handleCloseModal}
        >
          <span className='px-[40px]'>Annuler</span>
        </Button>
      </div>
    </Modal>
  )
}
