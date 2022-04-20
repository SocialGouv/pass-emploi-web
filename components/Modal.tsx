import { useEffect, useRef, useState } from 'react'
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
  const modalRef = useRef<HTMLDivElement>(null)

  function handleTabKey(e: any) {
    if (!modalRef.current) return

    const focusableModalElements: NodeListOf<HTMLElement> =
      modalRef.current.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
      )
    const firstElement = focusableModalElements[0]
    const lastElement =
      focusableModalElements[focusableModalElements.length - 1]

    if (!e.shiftKey && document.activeElement === lastElement) {
      firstElement.focus()
      e.preventDefault()
    }
    if (e.shiftKey && document.activeElement === firstElement) {
      lastElement.focus()
      e.preventDefault()
    }
  }

  function handleClose(e: any) {
    e.preventDefault()
    onClose()
  }

  function handleBackClick(e: any) {
    e.preventDefault()
    onBack()
  }

  const keyListenersMap = new Map([
    ['Tab', handleTabKey],
    ['Escape', handleClose],
  ])
  useEffect(() => {
    function keyListener(e: any) {
      const listener = keyListenersMap.get(e.key)
      return listener && listener(e)
    }

    setIsBrowser(true)
    document.addEventListener('keydown', keyListener)

    return () => document.removeEventListener('keydown', keyListener)
  }, [])

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
        ref={modalRef}
      >
        <div className='text-bleu_nuit flex justify-between items-center p-5'>
          {onBack && (
            <button type='button' onClick={handleBackClick}>
              <BackIcon
                role='img'
                focusable='false'
                className='mr-[24px]'
                aria-label='Revenir sur la fenêtre précédente'
              />
            </button>
          )}
          <h1 id='modal-title' className='h4-semi flex-auto'>
            {title}
          </h1>
          <button type='button' onClick={handleClose}>
            <CloseIcon
              role='img'
              focusable='false'
              aria-label='Fermer la fenêtre'
            />
          </button>
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
