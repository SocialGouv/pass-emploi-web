import React from 'react'

import Modal from 'components/Modal'
import Button from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'

interface OnboardingMobileModalProps {
  onClose: () => void
}

export default function OnboardingMobileModal({
  onClose,
}: OnboardingMobileModalProps) {
  return (
    <Modal
      title='Bienvenue sur l’espace mobile du conseiller'
      onClose={onClose}
    >
      <h3 className='flex text-base-bold'>
        <IconComponent
          name={IconName.Comment}
          focusable={false}
          aria-hidden={true}
          className='shrink-0 w-5 h-5 fill-primary mr-3'
        />
        Un accès dedié à vos conversations
      </h3>
      <p className='mt-4'>
        Retrouvez l’ensemble de vos conversations avec les bénéficiaires de
        votre portefeuile.
      </p>
      <p className='mt-4'>
        À ce jour, seul l’accès à la messagerie est disponible sur l’espace
        mobile.
      </p>
      <Button onClick={onClose} className='mt-8 w-full'>
        Terminer
      </Button>
    </Modal>
  )
}
