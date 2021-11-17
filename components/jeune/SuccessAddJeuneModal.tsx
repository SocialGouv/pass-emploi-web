import Modal from 'components/Modal'
import Button from 'components/Button'
import { Jeune } from 'interfaces'

type SuccessAddJeuneModalProps = {
	show: boolean
	onClose: any
	jeune: Jeune
}

const SuccessAddJeuneModal = ({
	show,
	onClose,
	jeune,
}: SuccessAddJeuneModalProps) => {
	const handleCloseModal = () => {
		onClose()
	}

	return (
		<>
			<Modal
				title='Votre jeune a été ajouté avec succès'
				onClose={handleCloseModal}
				show={show}
				customHeight='450px'
				customWidth='780px'
			>
				<div className='text-center'>
					<p className='text-md-semi text-black  mb-[30px]'>
						Identifiant de {jeune.firstName} {jeune.lastName}
					</p>

					<div className="flex mb-[30px]">
						<p className='h2-semi text-bleu_nuit bg-bleu_blanc p-[16px] m-auto rounded-medium'>
							{jeune.id}
						</p>
					</div>

					<p className='text-md text-bleu_nui mb-[48px]'>
						Cet identifiant va permettre au jeune de s’enregistrer sur
						l’application mobile Pass Emploi. Vous pourrez retrouver cet
						identifiant dans la partie “Mes jeunes”.
					</p>

					<Button type='button' onClick={handleCloseModal} className='m-auto'>
						<span className='px-[40px]'> Fermer </span>
					</Button>
				</div>
			</Modal>
		</>
	)
}

export default SuccessAddJeuneModal
