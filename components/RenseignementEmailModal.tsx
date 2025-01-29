import React from 'react'

import Modal from 'components/Modal'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'

interface RenseignementEmailModalProps {
  onAccederImilo: () => void
  onClose: () => void
}

export default function RenseignementEmailModal({
  onAccederImilo,
  onClose,
}: RenseignementEmailModalProps) {
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
        <ButtonLink
          href={process.env.NEXT_PUBLIC_IMILO_COORDONNEES_URL as string}
          onClick={onAccederImilo}
          externalIcon={IconName.OpenInNew}
          style={ButtonStyle.PRIMARY}
          label='Accéder à i-milo'
        />
      </div>
    </Modal>
  )
}
