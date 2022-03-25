import EchecModal from 'components/EchecModal'
import Modal from 'components/Modal'
import SuccessModal from 'components/SuccessModal'
import Button, { ButtonStyle } from 'components/ui/Button'
import { Rdv, RdvJeune } from 'interfaces/rdv'
import { useState } from 'react'
import { RendezVousService } from 'services/rendez-vous.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { formatDayDate } from 'utils/date'
import { useDependance } from 'utils/injectionDependances'

type DeleteRdvModalProps = {
  show: boolean
  onClose: any
  onDelete: () => void
  rdv: Rdv | RdvJeune
}

const DeleteRdvModal = ({
  show,
  onClose,
  onDelete,
  rdv,
}: DeleteRdvModalProps) => {
  const [isSuccess, setIsSuccess] = useState(false)
  const [isEchec, setIsEchec] = useState(false)
  const rendezVousService =
    useDependance<RendezVousService>('rendezVousService')
  const { data: session } = useSession<true>({ required: true })

  const handleDeleteRdv = () => {
    rendezVousService
      .deleteRendezVous(rdv.id, session!.accessToken)
      .then(function () {
        setIsSuccess(true)
        onDelete()
      })
      .catch(function (error) {
        setIsEchec(true)
        console.error('Erreur lors de la suppression du rendez-vous', error)
      })
  }

  const handleCloseModal = () => {
    setIsSuccess(false)
    setIsEchec(false)
    onClose()
  }

  useMatomo(isSuccess ? 'Succès modale suppression rdv' : undefined)

  useMatomo(isEchec ? 'Échec modale suppression rdv' : undefined)

  return (
    <>
      {Boolean(!isSuccess && !isEchec) && (
        <Modal
          title='Confirmation de suppression du rendez-vous'
          onClose={handleCloseModal}
          show={!isSuccess && show}
          customHeight='300px'
          customWidth='800px'
        >
          <p className='text-md text-bleu_nuit mb-[48px]'>
            Souhaitez-vous vraiment supprimer votre rendez-vous avec{' '}
            {rdv.jeune.prenom} {rdv.jeune.nom} le{' '}
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

      {isSuccess && (
        <SuccessModal
          show={isSuccess && show}
          message='Votre rendez-vous a bien été supprimé'
          onClose={handleCloseModal}
        />
      )}

      {isEchec && (
        <EchecModal
          show={isEchec && show}
          message="Votre rendez-vous n'a pas été supprimé, veuillez essayer ultérieurement"
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}

export default DeleteRdvModal
