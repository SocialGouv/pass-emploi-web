import React, { useEffect, useState } from 'react'
var ReactDOM = require('react-dom')

import CloseIcon from '../assets/icons/close_modal.svg'
import BackIcon from '../assets/icons/back_modale.svg'

import styles from 'styles/components/Modal.module.css'

type ModalProps = {
	title: string
	show: boolean
	onClose: any
	children: any
	onBack?: any
	customHeight?: string
	customWidth?: string
}

const Modal = ({
	show,
	onClose,
	onBack,
	children,
	title,
	customHeight,
	customWidth,
}: ModalProps) => {
	const [isBrowser, setIsBrowser] = useState(false)

	useEffect(() => {
		setIsBrowser(true)
	}, [])

	const handleCloseClick = (e: any) => {
		e.preventDefault()
		onClose()
	}

	const handleBackClick = (e: any) => {
		e.preventDefault()
		onBack()
	}

	const modalContent = show ? (
		<div className={styles.modalOverlay}>
			<div
				className='rounded-x_large bg-blanc'
				style={{
					height: customHeight || '664px',
					width: customWidth || '791px',
				}}
			>
				<div className='text-bleu_nuit flex justify-between items-center p-[40px] pb-[10px]'>
					{onBack && (
						<a href='#' onClick={handleBackClick}>
							<BackIcon
								role='img'
								focusable='false'
								className='mr-[24px]'
								aria-label='Revenir sur la fenêtre précédente'
							/>
						</a>
					)}
					{title && <div className='h4-semi flex-auto'>{title}</div>}
					<a href='#' onClick={handleCloseClick}>
						<CloseIcon
							role='img'
							focusable='false'
							aria-label='Fermer la fenêtre'
						/>
					</a>
				</div>
				<div className='p-[40px] pt-0'>{children}</div>
			</div>
		</div>
	) : null

	if (isBrowser) {
		const note = document.querySelector('html')
		if (note) {
			if (show) {
				note.style.overflowY = 'hidden'
			} else {
				note.style.overflowY = ''
			}
		}

		return ReactDOM.createPortal(
			modalContent,
			document.getElementById('modal-root')
		)
	} else {
		return null
	}
}

export default Modal
