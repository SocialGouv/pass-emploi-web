import React from 'react'

import Modal from 'components/Modal'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import styles from 'styles/components/Button.module.css'

interface RenseignementStructureModalProps {
  onContacterSupport: () => void
  onAccederImilo: () => void
  onClose: () => void
}

export default function RenseignementStructureModal({
  onContacterSupport,
  onAccederImilo,
  onClose,
}: RenseignementStructureModalProps) {
  const buttonsStyle = 'w-fit flex items-center justify-center text-s-bold'

  return (
    <Modal
      title='Votre structure n’est pas renseignée'
      titleIllustration={IllustrationName.Etablissement}
      onClose={onClose}
    >
      <p className='text-center'>
        Afin de pouvoir accéder à tout le contenu du portail CEJ, vous devez
        renseigner votre structure Mission Locale dans i-milo puis vous
        déconnecter et vous reconnecter.
      </p>
      <p className='text-center'>
        Sinon, vous ne pourrez pas consulter les sessions de votre structure.
      </p>

      <div className='flex justify-center mt-4'>
        <a
          href={'mailto:' + process.env.NEXT_PUBLIC_SUPPORT_MAIL}
          target='_blank'
          rel='noreferrer noopener'
          className={`${buttonsStyle} ${styles.button} ${styles.buttonTertiary}`}
          onClick={onContacterSupport}
        >
          <IconComponent
            name={IconName.Mail}
            aria-hidden={true}
            focusable={false}
            className='inline w-4 h-4 mr-2'
          />
          Contacter le support{' '}
          <span className='sr-only'>(nouvelle fenêtre)</span>
        </a>

        <a
          href={process.env.NEXT_PUBLIC_IMILO_URL as string}
          target='_blank'
          rel='noreferrer noopener'
          aria-label='Accéder à i-milo (nouvelle fenêtre)'
          className={`${buttonsStyle} ${styles.button} ${styles.buttonPrimary} ml-4`}
          onClick={onAccederImilo}
        >
          Accéder à i-milo <span className='sr-only'>(nouvelle fenêtre)</span>
          <IconComponent
            name={IconName.OpenInNew}
            aria-hidden={true}
            focusable={false}
            className='inline w-4 h-4 ml-2'
          />
        </a>
      </div>
    </Modal>
  )
}
