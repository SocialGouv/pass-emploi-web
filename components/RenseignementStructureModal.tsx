import React from 'react'

import Modal from 'components/Modal'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'

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

      <div className='flex justify-center mt-4 gap-4'>
        <ButtonLink
          href={'mailto:' + process.env.NEXT_PUBLIC_SUPPORT_MAIL}
          onClick={onContacterSupport}
          externalIcon={IconName.OpenInNew}
          style={ButtonStyle.TERTIARY}
          label='Contacter le support'
        />

        <ButtonLink
          href={process.env.NEXT_PUBLIC_IMILO_URL as string}
          onClick={onAccederImilo}
          externalIcon={IconName.OpenInNew}
          style={ButtonStyle.PRIMARY}
          label='Accéder à i-milo'
        />
      </div>
    </Modal>
  )
}
