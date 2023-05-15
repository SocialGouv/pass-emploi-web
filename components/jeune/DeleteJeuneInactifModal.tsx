import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IconName } from 'components/ui/IconComponent'
import { BaseJeune } from 'interfaces/jeune'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

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
      titleIcon={IconName.Warning}
      onClose={onClose}
    >
      <p className='mb-12 text-base-regular text-content_color text-center'>
        Une fois confirmée toutes les informations liées à ce compte jeune
        seront supprimées.
      </p>
      <p className='mb-12 text-base-regular text-content_color text-center'>
        Souhaitez-vous continuer la suppression ?
      </p>
      <div className='flex justify-center'>
        <Button type='button' style={ButtonStyle.SECONDARY} onClick={onClose}>
          Annuler
        </Button>
        <Button
          type='button'
          style={ButtonStyle.PRIMARY}
          onClick={onDelete}
          className='ml-6'
        >
          Confirmer
        </Button>
      </div>
    </Modal>
  )
}
