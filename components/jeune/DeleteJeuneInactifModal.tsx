import dynamic from 'next/dynamic'
import React from 'react'

import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { BaseJeune } from 'interfaces/jeune'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

const IllustrationDelete = dynamic(
  import('../../assets/images/illustration-delete.svg'),
  { ssr: false }
)

interface DeleteJeuneInactifModalProps {
  jeune: BaseJeune
  onClose: () => void
  onDelete: () => Promise<void>
}

export default function DeleteJeuneInactifModal({
  jeune,
  onClose,
  onDelete,
}: DeleteJeuneInactifModalProps) {
  const [portefeuille] = usePortefeuille()
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  useMatomo('Détail Jeune - Pop-in confirmation suppression', aDesBeneficiaires)

  return (
    <Modal
      title={`Suppression du compte bénéficiaire ${jeune.prenom} ${jeune.nom}`}
      onClose={onClose}
      illustration={
        <IllustrationDelete
          focusable='false'
          aria-hidden='true'
          className='w-1/3 m-auto fill-primary mb-8'
        />
      }
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
