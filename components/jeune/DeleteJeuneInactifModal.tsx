import React from 'react'

import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

interface DeleteJeuneInactifModalProps {
  jeune: BaseBeneficiaire
  onClose: () => void
  onDelete: () => Promise<void>
}

export default function DeleteJeuneInactifModal({
  jeune,
  onClose,
  onDelete,
}: DeleteJeuneInactifModalProps) {
  const [portefeuille] = usePortefeuille()
  useMatomo(
    'Détail Jeune - Pop-in confirmation suppression',
    portefeuille.length > 0
  )

  return (
    <Modal
      title={`Suppression du compte bénéficiaire ${jeune.prenom} ${jeune.nom}`}
      onClose={onClose}
      titleIllustration={IllustrationName.Delete}
    >
      <p className='mt-6 text-base-regular text-content_color text-center'>
        Une fois confirmée toutes les informations liées à ce compte jeune
        seront supprimées.
      </p>
      <div className='flex justify-center mt-4'>
        <Button type='button' style={ButtonStyle.SECONDARY} onClick={onClose}>
          Annuler
        </Button>
        <Button
          type='button'
          style={ButtonStyle.PRIMARY}
          onClick={onDelete}
          className='ml-6'
        >
          Supprimer le compte
        </Button>
      </div>
    </Modal>
  )
}
