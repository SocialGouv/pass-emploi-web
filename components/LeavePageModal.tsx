import Modal from './Modal'
import Button, { ButtonStyle } from './ui/Button'
import WarningIcon from '../assets/icons/warning.svg'

interface LeavePageModalProps {
  show: boolean
  message?: string
  onCancel: () => void
  onConfirm: () => void
}

export default function LeavePageModal({
  message,
  onCancel,
  onConfirm,
  show,
}: LeavePageModalProps) {
  return (
    <Modal show={show} title='Quitter la page ?' onClose={onCancel}>
      <div className='pt-10 text-center'>
        <WarningIcon focusable={false} aria-hidden={true} className='m-auto' />
        <p className='mt-6 text-base-medium'>{message}</p>
        <p className='mt-6'>Toutes les informations saisies seront perdues</p>
      </div>

      <div className='mt-14 flex justify-center'>
        <Button
          type='button'
          style={ButtonStyle.SECONDARY}
          onClick={onCancel}
          className='mr-3'
        >
          Annuler
        </Button>
        <Button type='button' style={ButtonStyle.PRIMARY} onClick={onConfirm}>
          Continuer
        </Button>
      </div>
    </Modal>
  )
}
