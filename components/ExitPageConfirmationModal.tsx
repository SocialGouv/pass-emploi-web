import linkStyles from 'styles/components/Link.module.css'
import Button, { ButtonStyle } from 'components/ui/Button'
import Link from 'next/link'
import { UrlObject } from 'url'
import WarningIcon from '../assets/icons/warning.svg'
import Modal from './Modal'

interface LeavePageModalProps {
  show: boolean
  onCancel: () => void
  href: string | UrlObject
  id?: string
  message?: string
}

export default function ExitPageConfirmationModal({
  message,
  onCancel,
  href,
  id,
  show,
}: LeavePageModalProps) {
  return (
    <Modal id={id} show={show} title='Quitter la page ?' onClose={onCancel}>
      <div className='px-20 text-center'>
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
        <Link href={href}>
          <a className={linkStyles.linkButtonBlue}>Continuer</a>
        </Link>
      </div>
    </Modal>
  )
}
