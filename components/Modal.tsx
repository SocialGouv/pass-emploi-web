import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from 'styles/components/Modal.module.css'
import BackIcon from '../assets/icons/back_modale.svg'
import CloseIcon from '../assets/icons/close_modal.svg'

interface ModalProps {
  title: string
  show: boolean
  onClose: any
  children: any
  onBack?: any
  customHeight?: string
  customWidth?: string
}

export default function Modal({
  show,
  onClose,
  onBack,
  children,
  title,
  customHeight,
  customWidth,
}: ModalProps) {
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
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
      className={styles.modalOverlay}
    >
      <div
        className='rounded-x_large bg-blanc'
        style={{
          height: customHeight,
          width: customWidth,
        }}
      >
        <div className='text-bleu_nuit flex justify-between items-center p-5'>
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
          <h1 id='modal-title' className='h4-semi flex-auto'>
            {title}
          </h1>
          <a href='#' onClick={handleCloseClick}>
            <CloseIcon
              role='img'
              focusable='false'
              aria-label='Fermer la fenêtre'
            />
          </a>
        </div>
        <div className='px-5 pt-3 pb-8'>{children}</div>
      </div>
    </div>
  ) : null

  if (isBrowser) {
    const modalRoot = document.getElementById('modal-root')
    return modalRoot ? createPortal(modalContent, modalRoot) : null
  } else {
    return null
  }
}
