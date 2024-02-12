import React from 'react'

import Modal from 'components/Modal'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import styles from 'styles/components/Button.module.css'

interface RenseignementEmailModalProps {
  onAccederImilo: () => void
  onClose: () => void
}

export default function RenseignementEmailModal({
  onAccederImilo,
  onClose,
}: RenseignementEmailModalProps) {
  const buttonsStyle = 'w-fit flex items-center justify-center text-s-bold'

  return (
    <Modal
      title='Votre adresse email n’est pas renseignée'
      titleIllustration={IllustrationName.Error}
      onClose={onClose}
    >
      <p className='text-center'>
        Afin de pouvoir bénéficier de toutes les fonctionnalités du portail CEJ,
        renseignez votre adresse email dans l’encart ”Contacts personnels” de
        votre profil i-milo.
      </p>

      <div className='flex justify-center mt-4'>
        <a
          href={process.env.NEXT_PUBLIC_IMILO_COORDONNEES_URL as string}
          target='_blank'
          rel='noreferrer noopener'
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
