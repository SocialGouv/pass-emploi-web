import WarningIcon from 'assets/icons/warning_blue.svg'
import ModalV2 from 'components/ModalV2'
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
    <ModalV2
      title='Suppression du rendez-vous'
      onClose={handleCloseModal}
      customHeight='468px'
      customWidth='639px'
    >
      <WarningIcon
        focusable={false}
        aria-hidden={true}
        className='m-auto mb-16'
      />

      <p className='text-base-medium text-content_color text-center'>
        L’ensemble des bénéficiaires sera notifié de la suppression
      </p>

      <p className='text-base-regular text-content_color text-center mt-12'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>

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
    </ModalV2>
  )
}
