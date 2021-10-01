import React, { useEffect, useState } from 'react'
var ReactDOM = require('react-dom')

import CloseIcon from '../assets/icons/close.svg'

import styles from 'styles/components/Modal.module.css'

type ModalProps = {
	title: string
	show: boolean
	onClose: any
	children: any
	customHeight?: string
	customWidth?: string
}

const Modal = ({
	show,
	onClose,
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

	const modalContent = show ? (
		<div className={styles.modalOverlay}>
			<div
				className='rounded-x_large bg-blanc'
				style={{
					height: customHeight || '664px',
					width: customWidth || '791px',
				}}
			>
				<div className={`text-bleu_nuit ${styles.modalHeader}`}>
					{title && <div className='h4-semi'>{title}</div>}
					<a href='#' onClick={handleCloseClick}>
						<CloseIcon
							role='img'
							focusable='false'
							aria-label='Fermer la modal'
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
