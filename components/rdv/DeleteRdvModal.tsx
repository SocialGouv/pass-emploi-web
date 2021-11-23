import Button, { ButtonColorStyle } from 'components/Button'
import EchecModal from 'components/EchecModal'
import Modal from 'components/Modal'
import SuccessModal from 'components/SuccessModal'

import { Rdv, RdvJeune } from 'interfaces/rdv'
import { useState } from 'react'

import { formatDayDate } from 'utils/date'

type RdvModalProps = {
  show: boolean
  onClose: any
  onDelete: () => void
  rdv: Rdv | RdvJeune
}

const DeleteRdvModal = ({ show, onClose, onDelete, rdv }: RdvModalProps) => {
  const [isSuccess, setIsSuccess] = useState(false)
  const [isEchec, setIsEchec] = useState(false)

  const handleDeleteRdv = () => {
    fetch(`${process.env.API_ENDPOINT}/rendezvous/${rdv.id}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then(function () {
        setIsSuccess(true)
        onDelete()
      })
      .catch(function (error) {
        setIsEchec(true)
        console.error('Conversation: Error while deleting rdv', error)
      })
  }

  const handleCloseModal = () => {
    setIsSuccess(false)
    setIsEchec(false)
    onClose()
  }

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
            Souhaitez-vous vraiment supprimer votre rendez-vous avec {rdv.title}{' '}
            le {formatDayDate(new Date(rdv.date))}?
          </p>

          <div className='flex'>
            <Button
              type='button'
              className='mr-[16px]'
              style={ButtonColorStyle.RED}
              onClick={handleDeleteRdv}
            >
              <span className='px-[40px]'> Supprimer </span>
            </Button>

            <Button
              type='button'
              style={ButtonColorStyle.WHITE}
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
