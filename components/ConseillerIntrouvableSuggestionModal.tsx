import React from 'react'

import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IconName } from 'components/ui/IconComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
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
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  function trackContacterSupportClick() {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Contact Support',
      action: 'Profil',
      nom: '',
      avecBeneficiaires: aDesBeneficiaires,
    })
  }

  return (
    <Modal
      title={`Vous ne trouvez pas le nom d’une conseillère ou d’un conseiller dans la liste ? La personne n’est peut-être pas encore rattachée à votre agence.`}
      titleIcon={IconName.Help}
      onClose={onClose}
    >
      <p className='mb-12 text-base-regular text-content_color text-center'>
        Si le conseiller ou la conseillère n’a pas ajouté l’agence à son profil,
        une fenêtre lui demandera de le faire à chaque connexion. En attendant,
        vous devrez renseigner son e-mail à la main. <br />
        En cas de difficulté,&nbsp;
        <span className='text-primary_darken hover:text-primary'>
          <ExternalLink
            href={'mailto:' + process.env.SUPPORT_MAIL}
            label={'contactez le support'}
            iconName={IconName.OutgoingMail}
            onClick={trackContacterSupportClick}
          />
        </span>
      </p>
      <div className='flex justify-center'>
        <Button type='button' style={ButtonStyle.PRIMARY} onClick={onClose}>
          J’ai compris
        </Button>
      </div>
    </Modal>
  )
}
