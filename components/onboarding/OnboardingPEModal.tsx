import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import React, { MouseEvent, ReactNode, useRef, useState } from 'react'

import onboardingMessagerie from 'assets/images/onboarding_messagerie_pole-emploi.webp'
import onboardingOffres from 'assets/images/onboarding_offres_pole-emploi.webp'
import onboardingPortefeuille from 'assets/images/onboarding_portefeuille_pole-emploi.webp'
import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import { Conseiller } from 'interfaces/conseiller'

interface OnboardingPEModalProps {
  conseiller: Conseiller
  onClose: () => void
}

export default function OnboardingPEModal({
  conseiller,
  onClose,
}: OnboardingPEModalProps) {
  const [etape, setEtape] = useState<
    'ACCUEIL' | 'PORTEFEUIILLE' | 'MESSAGERIE' | 'OFFRES'
  >('ACCUEIL')

  return (
    <>
      {etape === 'ACCUEIL' && (
        <OnboardingPEEtapeModal
          illustratioName={IllustrationName.LogoCEJ}
          titre={`Bienvenue ${conseiller.firstName} dans votre espace conseiller CEJ`}
          onClose={onClose}
          onContinue={() => setEtape('PORTEFEUIILLE')}
        >
          <h3 className='text-m-bold text-center mb-4'>
            Découvrez les principales fonctionnalités de l’outil
          </h3>
          <ul className='w-fit m-auto'>
            <ListItem
              item='Le portefeuille'
              illustration={IllustrationName.People}
            />
            <ListItem
              item='La messagerie'
              illustration={IllustrationName.Messagerie}
            />
            <ListItem
              item='Les offres d’emploi'
              illustration={IllustrationName.Search}
            />
          </ul>
        </OnboardingPEEtapeModal>
      )}

      {etape === 'PORTEFEUIILLE' && (
        <OnboardingPEEtapeModal
          imageSrc={onboardingPortefeuille}
          titre='Le portefeuille'
          onClose={onClose}
          onContinue={() => setEtape('MESSAGERIE')}
        >
          <p>
            Créez en toute autonomie les comptes de vos bénéficiaires et accédez
            à leur fiche en un clic. Retrouvez les offres et recherches que vos
            bénéficiaires ont mises en favoris.
          </p>
        </OnboardingPEEtapeModal>
      )}

      {etape === 'MESSAGERIE' && (
        <OnboardingPEEtapeModal
          imageSrc={onboardingMessagerie}
          titre='La messagerie'
          onClose={onClose}
          onContinue={() => setEtape('OFFRES')}
        >
          <p>
            Dès le compte activé, échangez avec un ou plusieurs bénéficiaires et
            partagez leur des offres d’emploi. Créez et gérez vos listes de
            diffusion pour gagner du temps.
          </p>
        </OnboardingPEEtapeModal>
      )}

      {etape === 'OFFRES' && (
        <OnboardingPEEtapeModal
          imageSrc={onboardingOffres}
          titre='Les offres'
          onClose={onClose}
        >
          <p>
            Recherchez des offres d’emploi et d’immersion pertinentes à partager
            à un ou plusieurs de vos bénéficiaires.
          </p>
        </OnboardingPEEtapeModal>
      )}
    </>
  )
}

function OnboardingPEEtapeModal({
  illustratioName,
  imageSrc,
  titre,
  children,
  onClose,
  onContinue,
}: {
  illustratioName?: IllustrationName
  imageSrc?: StaticImport
  titre: string
  children: ReactNode
  onClose: () => void
  onContinue?: () => void
}) {
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  return (
    <Modal
      title={titre}
      onClose={onClose}
      ref={modalRef}
      titleImageSrc={imageSrc}
      titleIllustration={illustratioName}
    >
      {children}

      {onContinue && (
        <div className='w-fit mt-6 mx-auto flex gap-4'>
          <Button
            style={ButtonStyle.SECONDARY}
            onClick={(e) => modalRef.current!.closeModal(e)}
          >
            Passer l’intro
          </Button>
          <Button style={ButtonStyle.PRIMARY} onClick={() => onContinue()}>
            Continuer
            <IconComponent
              name={IconName.ArrowForward}
              aria-hidden={true}
              focusable={false}
              className='ml-2 w-4 h-4'
            />
          </Button>
        </div>
      )}

      {!onContinue && (
        <Button
          style={ButtonStyle.PRIMARY}
          onClick={(e) => modalRef.current!.closeModal(e)}
          className='block w-fit mt-6 mx-auto'
        >
          Commencer
          <IconComponent
            name={IconName.ArrowForward}
            aria-hidden={true}
            focusable={false}
            className='ml-2 w-4 h-4'
          />
        </Button>
      )}
    </Modal>
  )
}

function ListItem({
  item,
  illustration,
}: {
  item: string
  illustration: IllustrationName
}) {
  return (
    <li className='text-m-regular'>
      <IllustrationComponent
        name={illustration}
        focusable={false}
        aria-hidden={true}
        className='inline-block fill-primary w-[56px] h-[56px]'
      />
      {item}
    </li>
  )
}
