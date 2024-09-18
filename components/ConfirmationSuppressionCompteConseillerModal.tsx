import Modal from 'components/Modal'
import IconComponent, { IconName } from 'components/ui/IconComponent'

export default function ConfirmationSuppressionCompteConseillerModal() {
  return (
    <Modal
      title='Votre compte conseiller a bien été supprimé'
      onClose={() => {}}
    >
      <div className='px-20 text-center'>
        <IconComponent
          name={IconName.Schedule}
          focusable={false}
          aria-hidden={true}
          className='w-[54px] h-[54px] m-auto fill-primary mb-6'
        />
        <p className='mt-6 text-base-bold textp-primary'>
          Vous allez être redirigé dans quelques secondes
        </p>
      </div>
    </Modal>
  )
}
