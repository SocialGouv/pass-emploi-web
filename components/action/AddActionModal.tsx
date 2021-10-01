import React, { useState } from 'react'
import router from 'next/router'

import { UserAction } from 'interfaces'
import { actionsPredefinies } from 'referentiel/action'

import Modal from 'components/Modal'
import Button from 'components/Button'

type ActionModalProps = {
	show: boolean
	onClose: any
	onAdd: any
}

const now = new Date()

const defaultAction: UserAction = {
	id: '',
	content: '',
	comment: '',
	isDone: false,
	lastUpdate: now,
	creationDate: now,
}

const AddActionModal = ({ show, onClose, onAdd }: ActionModalProps) => {
	const [selectedAction, setSelectedAction] = useState(defaultAction)
	const [newComment, setNewComment] = useState('')
	const [isCommentMode, setIsCommentMode] = useState(false)

	const noSelectedAction = () => Boolean(selectedAction.id === '')

	const handleSelectedAction = (selectedAction: UserAction) => {
		setSelectedAction(selectedAction)
		setIsCommentMode(true)
	}

	const handleAddClick = (event: any) => {
		event.preventDefault()

		if (noSelectedAction()) {
			return
		}

		const now = new Date()
		selectedAction.id = Date.now().toString()
		selectedAction.isDone = false
		selectedAction.lastUpdate = now
		selectedAction.creationDate = now
		selectedAction.comment = newComment

		console.log('selectedAction', selectedAction)

		fetch(
			`${process.env.API_ENDPOINT}/jeunes/${router.query.jeune_id}/action`,
			{
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(selectedAction),
			}
		).then(function (response) {
			setSelectedAction(defaultAction)
			onAdd(selectedAction)
			onClose()
		})
	}

	const handleCloseModal = () => {
		setSelectedAction(defaultAction)
		setIsCommentMode(false)
		setNewComment('')
		onClose()
	}

	return (
		<>
			<Modal
				title='Créer une nouvelle action'
				onClose={handleCloseModal}
				show={!isCommentMode && show}
				customHeight='636px'
				customWidth='939px'
			>
				<div className='mb-[40px]'>
					<Button type='button'>Actions prédéfinies</Button>
				</div>

				<div className='h-[425px] overflow-scroll mb-[40px]'>
					{actionsPredefinies.map((action: UserAction) => (
						<button
							key={action.id}
							type='button'
							className='w-full px-[24px] py-[16px] mb-[8px] text-left border border-bleu_blanc rounded-medium'
							onClick={() => handleSelectedAction(action)}
						>
							<p className='text-sm text-bleu_nuit'>{action.content}</p>
						</button>
					))}
				</div>
			</Modal>

			<Modal
				title={selectedAction.content}
				onClose={handleCloseModal}
				show={isCommentMode && show}
				customHeight='380px'
				customWidth='939px'
			>
				<form onSubmit={handleAddClick}>
					<label htmlFor='comment' className='hidden'>
						Ajouter un commentaire à votre action
					</label>

					<textarea
						id='comment'
						name='comment'
						rows={5}
						cols={5}
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						className='w-full text-sm text-bleu_nuit p-[16px] mb-[40px] border border-bleu_blanc rounded-medium'
						placeholder='Ajouter un commentaire...'
					></textarea>

					<Button
						type='submit'
						className='px-[48px] py-[11px] m-auto'
						disabled={noSelectedAction()}
					>
						<span className='px-[76px]'>Envoyer</span>
					</Button>
				</form>
			</Modal>
		</>
	)
}

export default AddActionModal
