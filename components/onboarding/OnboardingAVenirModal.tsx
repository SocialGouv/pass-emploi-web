import React, { MouseEvent, useRef } from 'react'

import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { Conseiller, estPoleEmploiBRSA } from 'interfaces/conseiller'

interface OnboardingAVenirModalProps {
  conseiller: Conseiller
  onClose: () => void
}

export default function OnboardingAVenirModal({
  conseiller,
  onClose,
}: OnboardingAVenirModalProps) {
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  const espace = estPoleEmploiBRSA(conseiller) ? 'pass emploi' : 'CEJ'
  const illustrationName = estPoleEmploiBRSA(conseiller)
    ? IllustrationName.LogoPassemploi
    : IllustrationName.LogoCEJ

  return (
    <Modal
      title={`Bienvenue ${conseiller.firstName} dans votre espace conseiller ${espace}`}
      onClose={onClose}
      ref={modalRef}
      titleIllustration={illustrationName}
    >
      <h3>
        Découvrez prochainement les principales fonctionnalités de l’outil
      </h3>

      <Button
        style={ButtonStyle.PRIMARY}
        onClick={(e) => modalRef.current!.closeModal(e)}
        className='block mt-6 mx-auto'
      >
        Commencer
        <IconComponent
          name={IconName.ArrowForward}
          aria-hidden={true}
          focusable={false}
          className='ml-2 w-4 h-4'
        />
      </Button>
    </Modal>
  )
}
