import CheckIcon from '../assets/icons/check.svg'

import Modal from 'components/Modal'
import Button from 'components/ui/Button'

type SuccessModalProps = {
  onClose: any
  message: string
}

export default function SuccessModal({ onClose, message }: SuccessModalProps) {
  function handleCloseModal() {
    onClose()
  }

  return (
    <Modal
      title='Succès'
      showTitle={false}
      onClose={handleCloseModal}
      customHeight='350px'
      customWidth='780px'
    >
      <CheckIcon
        className='m-auto mb-[30px]'
        focusable='false'
        aria-hidden='true'
      />

      <p className='text-md text-primary_darken text-center mb-[30px]'>
        {message}
      </p>

      <Button type='button' onClick={handleCloseModal} className='m-auto'>
        <span className='px-[40px]'> C&apos;est compris </span>
      </Button>
    </Modal>
  )
}
