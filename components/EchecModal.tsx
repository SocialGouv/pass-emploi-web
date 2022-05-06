import Modal from 'components/Modal'
import Button from 'components/ui/Button'

type EchecModalProps = {
  onClose: any
  message: string
}

export default function EchecModal({ onClose, message }: EchecModalProps) {
  function handleCloseModal() {
    onClose()
  }

  return (
    <Modal
      title='Échec'
      showTitle={false}
      onClose={handleCloseModal}
      customHeight='250px'
      customWidth='780px'
    >
      <p className='text-md text-primary_darken text-center mb-[30px]'>
        {message}
      </p>

      <Button type='button' onClick={handleCloseModal} className='m-auto'>
        <span className='px-[40px]'> C&apos;est compris </span>
      </Button>
    </Modal>
  )
}
