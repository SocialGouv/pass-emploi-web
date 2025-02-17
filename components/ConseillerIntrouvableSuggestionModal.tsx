import React, { useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IconName } from 'components/ui/IconComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { estPassEmploi } from 'interfaces/structure'
import { trackEvent } from 'utils/analytics/matomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

interface ConseillerIntrouvableSuggestionModalProps {
  onClose: () => void
}
export default function ConseillerIntrouvableSuggestionModal({
  onClose,
}: ConseillerIntrouvableSuggestionModalProps) {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()

  function trackContacterSupportClick() {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Contact Support',
      action: 'Profil',
      nom: '',
      aDesBeneficiaires: portefeuille.length > 0,
    })
  }

  const modalRef = useRef<ModalHandles>(null)

  return (
    <Modal
      ref={modalRef}
      title='Vous ne trouvez pas le nom d’une conseillère ou d’un conseiller dans la liste ?'
      titleIcon={IconName.Help}
      onClose={onClose}
    >
      <p className='mb-4 text-base-bold text-content_color text-center'>
        La conseillère ou le conseiller en question ne s’est peut-être jamais
        connecté(e) à l’Application{' '}
        {estPassEmploi(conseiller.structure) ? 'pass emploi' : 'du CEJ'}.
      </p>
      <p className='mb-12 text-base-regular text-content_color text-center'>
        Nous l’invitons à effectuer une première connexion pour apparaître dans
        les suggestions. Si malgré ça vous rencontrez des difficultés,&nbsp;
        <span className='text-primary_darken hover:text-primary'>
          <ExternalLink
            href={'mailto:' + process.env.NEXT_PUBLIC_SUPPORT_MAIL}
            label='contactez le support'
            iconName={IconName.OutgoingMail}
            onClick={trackContacterSupportClick}
          />
        </span>
      </p>
      <div className='flex justify-center'>
        <Button
          type='button'
          style={ButtonStyle.PRIMARY}
          onClick={(e) => modalRef.current!.closeModal(e)}
        >
          J’ai compris
        </Button>
      </div>
    </Modal>
  )
}
