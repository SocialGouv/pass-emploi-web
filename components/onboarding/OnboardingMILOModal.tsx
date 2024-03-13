import Image from 'next/image'
import React, { MouseEvent, ReactNode, useRef, useState } from 'react'

import onboardingAgenda from 'assets/images/onboarding_agenda_milo.webp'
import onboardingMessagerie from 'assets/images/onboarding_messagerie_milo.webp'
import onboardingOffres from 'assets/images/onboarding_offres_milo.webp'
import onboardingPilotage from 'assets/images/onboarding_pilotage_milo.webp'
import onboardingPortefeuille from 'assets/images/onboarding_portefeuille_milo.webp'
import onboardingReaffectation from 'assets/images/onboarding_reaffectation_milo.webp'
import Modal from 'components/Modal'
import OnboardingListItem from 'components/onboarding/OnboardingListItem'
import ProgressBar from 'components/onboarding/ProgressBar'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { Conseiller } from 'interfaces/conseiller'

type OnboardingMILOModalProps = {
  conseiller: Conseiller
  onClose: () => void
}

export default function OnboardingMILOModal({
  conseiller,
  onClose,
}: OnboardingMILOModalProps) {
  const [etape, setEtape] = useState<
    | 'ACCUEIL'
    | 'PORTEFEUIILLE-AGENDA'
    | 'MESSAGERIE-PILOTAGE'
    | 'OFFRES-REAFFECTATION'
  >('ACCUEIL')

  return (
    <>
      {etape === 'ACCUEIL' && (
        <OnboardingMILOEtapeModal
          titre={`Bienvenue ${conseiller.firstName} dans votre espace conseiller CEJ`}
          onClose={onClose}
          onContinue={() => setEtape('PORTEFEUIILLE-AGENDA')}
        >
          <h3 className='text-m-bold text-center mb-4'>
            Découvrez les principales fonctionnalités de l’outil
          </h3>
          <ul className='w-fit m-auto grid grid-cols-2'>
            <OnboardingListItem
              item='Le portefeuille'
              illustration={IllustrationName.People}
            />
            <OnboardingListItem
              item='L’agenda'
              illustration={IllustrationName.Event}
            />
            <OnboardingListItem
              item='La messagerie'
              illustration={IllustrationName.Messagerie}
            />
            <OnboardingListItem
              item='Le pilotage'
              illustration={IllustrationName.Checklist}
            />
            <OnboardingListItem
              item='Les offres d’emploi'
              illustration={IllustrationName.Search}
            />
            <OnboardingListItem
              item='La réaffectation'
              illustration={IllustrationName.ArrowForward}
            />
          </ul>
        </OnboardingMILOEtapeModal>
      )}

      {etape === 'PORTEFEUIILLE-AGENDA' && (
        <OnboardingMILOEtapeModal
          titre='Le portefeuille et l’agenda'
          onClose={onClose}
          onContinue={() => setEtape('MESSAGERIE-PILOTAGE')}
        >
          <div className='flex gap-4'>
            <div className='p-4 border border-grey_100 rounded-base flex-1'>
              <Image
                src={onboardingPortefeuille}
                alt=''
                aria-hidden={true}
                className='m-auto mb-8'
              />
              <h3 className='text-m-bold text-primary mb-2'>Le portefeuille</h3>
              <p>
                Créez en toute autonomie les comptes de vos bénéficiaires et
                accédez à leur fiche en un clic. Consultez leurs actions,
                rendez-vous et favoris en toute simplicité !
              </p>
            </div>
            <div className='p-4 border border-grey_100 rounded-base flex-1'>
              <Image
                src={onboardingAgenda}
                alt=''
                aria-hidden={true}
                className='m-auto mb-8'
              />
              <h3 className='text-m-bold text-primary mb-2'>L’agenda</h3>
              <p>
                Organisez aisément votre agenda et celui de vos bénéficiaires.
                Mettez en avant les événements de votre établissement auprès de
                vos bénéficiaires et gérez leur inscription en quelques clics.
              </p>
            </div>
          </div>
          <ProgressBar etapeCourante={1} etapes={3} />
        </OnboardingMILOEtapeModal>
      )}

      {etape === 'MESSAGERIE-PILOTAGE' && (
        <OnboardingMILOEtapeModal
          titre='La messagerie et le pilotage'
          onClose={onClose}
          onContinue={() => setEtape('OFFRES-REAFFECTATION')}
        >
          <div className='flex gap-4'>
            <div className='p-4 border border-grey_100 rounded-base flex-1'>
              <Image
                src={onboardingMessagerie}
                alt=''
                aria-hidden={true}
                className='m-auto mb-8'
              />
              <h3 className='text-m-bold text-primary mb-2'>La messagerie</h3>
              <p>
                Dès le compte activé, échangez avec un ou plusieurs
                bénéficiaires et partagez leur des événements et offres
                d’emploi. Créez et gérez vos listes de diffusion pour gagner du
                temps.
              </p>
            </div>
            <div className='p-4 border border-grey_100 rounded-base flex-1'>
              <Image
                src={onboardingPilotage}
                alt=''
                aria-hidden={true}
                className='m-auto mb-8'
              />
              <h3 className='text-m-bold text-primary mb-2'>Le pilotage</h3>
              <p>
                Retrouvez facilement les actions à qualifier ainsi que les
                animations collectives et sessions à clore.
              </p>
            </div>
          </div>
          <ProgressBar etapeCourante={2} etapes={3} />
        </OnboardingMILOEtapeModal>
      )}

      {etape === 'OFFRES-REAFFECTATION' && (
        <OnboardingMILOEtapeModal
          titre='Les offres et la réaffectation'
          onClose={onClose}
        >
          <div className='flex  gap-4'>
            <div className='p-4 border border-grey_100 rounded-base flex-1'>
              <Image
                src={onboardingOffres}
                alt=''
                aria-hidden={true}
                className='m-auto mb-8'
              />
              <h3 className='text-m-bold text-primary mb-2'>Les offres</h3>
              <p>
                Recherchez des offres d’emploi, alternance, service civique et
                d’immersion pertinentes à partager à un ou plusieurs de vos
                bénéficiaires.
              </p>
            </div>
            <div className='p-4 border border-grey_100 rounded-base flex-1'>
              <Image
                src={onboardingReaffectation}
                alt=''
                aria-hidden={true}
                className='m-auto mb-8'
              />
              <h3 className='text-m-bold text-primary mb-2'>
                La réaffectation
              </h3>
              <p>
                Assurez la continuité de l’accompagnement en transférant les
                bénéficiaires durant vos absences ou en reprenant ceux de vos
                collègues.
              </p>
            </div>
          </div>
          <ProgressBar etapeCourante={3} etapes={3} />
        </OnboardingMILOEtapeModal>
      )}
    </>
  )
}

function OnboardingMILOEtapeModal({
  titre,
  children,
  onClose,
  onContinue,
}: {
  titre: string
  children: ReactNode
  onClose: () => void
  onContinue?: () => void
}) {
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  return (
    <Modal title={titre} onClose={onClose} ref={modalRef}>
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
