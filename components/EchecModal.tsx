import Modal from 'components/Modal'
import Button from 'components/ui/Button'

type EchecModalProps = {
  onClose: any
  message: string
}

const EchecModal = ({ onClose, message }: EchecModalProps) => {
  const handleCloseModal = () => {
    onClose()
  }

  return (
    <Modal
      title='   '
      onClose={handleCloseModal}
      customHeight='250px'
      customWidth='780px'
    >
      <p className='text-md text-bleu_nuit text-center mb-[30px]'>{message}</p>

      <Button type='button' onClick={handleCloseModal} className='m-auto'>
        <span className='px-[40px]'> C&apos;est compris </span>
      </Button>
    </Modal>
  )
}

export default EchecModal
