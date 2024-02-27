import React, { useState } from 'react'

import Modal from 'components/Modal'
import { TutorielRaccourci } from 'components/TutorielRaccourci'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'

interface OnboardingMobileModalProps {
  onClose: () => void
}

export default function OnboardingMobileModal({
  onClose,
}: OnboardingMobileModalProps) {
  const [etape, setEtape] = useState<number>(1)

  function accueil(): JSX.Element {
    return (
      <>
        <h3 className='flex text-base-bold'>
          <IconComponent
            name={IconName.ChatFill}
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
      </>
    )
  }

  return (
    <Modal
      title='Bienvenue sur l’espace mobile du conseiller'
      onClose={onClose}
    >
      {etape === 1 && accueil()}
      {etape === 2 && <TutorielRaccourci />}
      <div className='mt-8'>
        <Button onClick={onClose} className='w-full'>
          Terminer
        </Button>
        {etape === 1 && (
          <Button
            onClick={() => setEtape(2)}
            style={ButtonStyle.SECONDARY}
            className='mt-2 w-full'
          >
            Créer un raccourci
          </Button>
        )}
      </div>
    </Modal>
  )
}
