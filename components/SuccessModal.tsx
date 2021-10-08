import Modal from 'components/Modal'
import Button from 'components/Button'

import CheckIcon from '../assets/icons/check.svg'

type SuccessModalProps = {
	show: boolean
	onClose: any
	message: string
}

const SuccessModal = ({ show, onClose, message }: SuccessModalProps) => {
	const handleCloseModal = () => {
		onClose()
	}

	return (
		<>
			<Modal
				title='   '
				onClose={handleCloseModal}
				show={show}
				customHeight='350px'
				customWidth='780px'
			>
				<CheckIcon
					className='m-auto mb-[30px]'
					focusable='false'
					aria-hidden='true'
				/>

				<p className='text-md text-bleu_nuit text-center mb-[30px]'>
					{message}
				</p>

				<Button type='button' onClick={handleCloseModal} className='m-auto'>
					<span className='px-[40px]'> C est compris </span>
				</Button>
			</Modal>
		</>
	)
}

export default SuccessModal
