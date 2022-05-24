import { useState } from 'react'

import EchecModal from 'components/EchecModal'
import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button'
import { getBeneficiaires, Rdv } from 'interfaces/rdv'
import useMatomo from 'utils/analytics/useMatomo'
import { formatDayDate } from 'utils/date'

type DeleteRdvModalProps = {
  rdv: Rdv
  onClose: () => void
  performDelete: Promise<void>
  onDeleteSuccess: (deletedRdv: Rdv) => void
}

export default function DeleteRdvModal({
  rdv,
  onClose,
  performDelete,
  onDeleteSuccess,
}: DeleteRdvModalProps) {
  const [isEchec, setIsEchec] = useState(false)

  function handleDeleteRdv() {
    performDelete
      .then(function () {
        onDeleteSuccess(rdv)
      })
      .catch(function (error) {
        setIsEchec(true)
        console.error('Erreur lors de la suppression du rendez-vous', error)
      })
  }

  function handleCloseModal() {
    setIsEchec(false)
    onClose()
  }

  useMatomo(isEchec ? 'Échec modale suppression rdv' : undefined)

  return (
    <>
      {!isEchec && (
        <Modal
          title='Confirmation de suppression du rendez-vous'
          onClose={handleCloseModal}
          customHeight='300px'
          customWidth='800px'
        >
          <p className='text-md text-primary_darken mb-[48px]'>
            Souhaitez-vous vraiment supprimer votre rendez-vous avec{' '}
            {getBeneficiaires(rdv.jeunes)} le{' '}
            {formatDayDate(new Date(rdv.date))}?
          </p>

          <div className='flex'>
            <Button
              type='button'
              className='mr-[16px]'
              style={ButtonStyle.WARNING}
              onClick={handleDeleteRdv}
            >
              <span className='px-[40px]'> Supprimer </span>
            </Button>

            <Button
              type='button'
              style={ButtonStyle.SECONDARY}
              onClick={handleCloseModal}
            >
              <span className='px-[40px]'> Annuler </span>
            </Button>
          </div>
        </Modal>
      )}

      {isEchec && (
        <EchecModal
          message="Votre rendez-vous n'a pas été supprimé, veuillez essayer ultérieurement"
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}
