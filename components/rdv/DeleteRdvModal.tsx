import Modal from 'components/Modal'
import SuccessModal from 'components/SuccessModal'
import Button from 'components/Button'

import { formatDayDate } from 'utils/date'

import { Rdv } from 'interfaces/rdv'
import { useState } from 'react'

type RdvModalProps = {
	show: boolean
	onClose: any
	onDelete: any
	rdv: Rdv
}

const DeleteRdvModal = ({ show, onClose, onDelete, rdv }: RdvModalProps) => {
	const [isSuccess, setIsSuccess] = useState(false)

	const handleDeleteRdv = () => {
		fetch(`${process.env.API_ENDPOINT}/rendezvous/${rdv.id}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({}),
		}).then(function (response) {
			setIsSuccess(true)
			onDelete()
		})
	}

	const handleCloseModal = () => {
		onClose()
	}

	return (
		<>
			{!isSuccess && (
				<Modal
					title='Confirmation de suppression du rendez-vous'
					onClose={handleCloseModal}
					show={!isSuccess && show}
					customHeight='300px'
					customWidth='800px'
				>
					<p className='text-md text-bleu_nuit mb-[48px]'>
						Souhaitez-vous vraiment supprimer votre {rdv.title} le{' '}
						{formatDayDate(new Date(rdv.date))}?
					</p>

					<div className='flex'>
						<Button
							type='button'
							className='mr-[16px]'
							style={'red'}
							onClick={handleDeleteRdv}
						>
							<span className='px-[40px]'> Supprimer </span>
						</Button>

						<Button type='button' style={'white'} onClick={handleCloseModal}>
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
		</>
	)
}

export default DeleteRdvModal
