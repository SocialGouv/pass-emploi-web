import React, { useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { getUrlContact } from 'utils/faq'

type ReaffectationVerificationMissionLocaleModalProps = {
  onClose: () => void
  onReaffectation: () => void
}

export default function ReaffectationVerificationMissionLocaleModal({
  onClose,
  onReaffectation,
}: ReaffectationVerificationMissionLocaleModalProps) {
  const modalRef = useRef<ModalHandles>(null)

  const [conseiller] = useConseiller()

  const urlContact = getUrlContact(conseiller.structure)

  function reaffecter() {
    modalRef.current!.closeModal()
    onReaffectation()
  }

  return (
    <Modal
      ref={modalRef}
      title='Vous êtes sur le point de réaffecter un ou plusieurs bénéficiaires appartenant à une autre Mission Locale.'
      onClose={onClose}
    >
      <p>
        Si vous poursuivez la réaffectation, certaines fonctionnalités ne seront
        pas disponibles pour le futur conseiller du bénéficiaire :
      </p>
      <ul className='list-inside list-disc'>
        <li>
          Le futur conseiller ne pourra pas valider les actions du bénéficiaire
        </li>
        <li>
          Le bénéficiaire ne pourra pas consulter les événements de sa nouvelle
          Mission Locale
        </li>
      </ul>

      <p className='mt-4 whitespace-pre-wrap'>
        Pour garantir le suivi du bénéficiaire, demandez au conseiller actuel du
        bénéficiaire d’archiver ce dernier dans son portefeuille. Une fois le
        bénéficiaire archivé, le nouveau conseiller pourra le recréer depuis son
        portail.
      </p>

      <p className='mt-4'>
        En cas de difficulté vous pouvez&nbsp;
        <span className='text-primary_darken hover:text-primary'>
          <ExternalLink
            href={urlContact}
            label='contacter le support'
            onClick={() => {}}
          />
        </span>
      </p>

      <div className='flex justify-center mt-4 gap-4'>
        <Button
          type='button'
          style={ButtonStyle.SECONDARY}
          onClick={() => modalRef.current!.closeModal()}
        >
          Annuler
        </Button>
        <Button type='button' style={ButtonStyle.PRIMARY} onClick={reaffecter}>
          Continuer le réaffectation
        </Button>
      </div>
    </Modal>
  )
}
