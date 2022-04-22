import {
  forwardRef,
  MouseEvent,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import styles from 'styles/components/Modal.module.css'
import BackIcon from '../assets/icons/back_modale.svg'
import CloseIcon from '../assets/icons/close_modal.svg'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  showTitle?: boolean
  onBack?: () => void
  customHeight?: string
  customWidth?: string
}

const Modal = forwardRef((props: ModalProps, ref) => {
  const {
    children: modalContent,
    customHeight,
    customWidth,
    onBack,
    onClose,
    showTitle = true,
    title,
  } = props

  useImperativeHandle(ref, () => ({
    closeModal: handleClose,
  }))

  const [isBrowser, setIsBrowser] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusedElement = useRef<HTMLElement | null>(null)
  const keyListeners = useRef(
    new Map([
      ['Tab', handleTabKey],
      ['Escape', handleClose],
    ])
  )

  function focusOnRender(element: HTMLElement | null) {
    if (element && !previousFocusedElement.current) {
      previousFocusedElement.current = document.activeElement as HTMLElement
      element.focus()
    }
  }

  function handleTabKey(e: KeyboardEvent) {
    if (!modalRef.current) return

    const focusableModalElements: NodeListOf<HTMLElement> =
      modalRef.current.querySelectorAll(
        'a[href], button, textarea, input, select'
      )
    const firstTabElement = focusableModalElements[0]
    const lastTabElement =
      focusableModalElements[focusableModalElements.length - 1]

    if (!e.shiftKey && document.activeElement === lastTabElement) {
      firstTabElement.focus()
      e.preventDefault()
    }
    if (e.shiftKey && document.activeElement === firstTabElement) {
      lastTabElement.focus()
      e.preventDefault()
    }
  }

  function handleClose(e: KeyboardEvent | MouseEvent) {
    e.preventDefault()
    if (previousFocusedElement.current) previousFocusedElement.current.focus()
    onClose()
  }

  // FIXME à supprimer quand creation action sur page dédiée
  function handleBackClick(e: MouseEvent) {
    e.preventDefault()
    onBack!()
  }

  function keyListener(e: KeyboardEvent) {
    const listener = keyListeners.current.get(e.key)
    return listener && listener(e)
  }

  useEffect(() => {
    setIsBrowser(true)
    document.addEventListener('keydown', keyListener)

    return () => document.removeEventListener('keydown', keyListener)
  }, [])

  const modalTemplate = (
    <div
      className='rounded-x_large bg-blanc'
      style={{
        height: customHeight,
        width: customWidth,
      }}
      ref={modalRef}
    >
      <div className='text-bleu_nuit flex justify-end items-center p-5'>
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
        {showTitle && (
          <h1 id='modal-title' className='h4-semi flex-auto'>
            {title}
          </h1>
        )}
        <button type='button' onClick={handleClose} ref={focusOnRender}>
          <CloseIcon
            role='img'
            focusable='false'
            aria-label='Fermer la fenêtre'
          />
        </button>
      </div>
      <div className='px-5 pt-3 pb-8'>{modalContent}</div>
    </div>
  )

  const modalContainer = (
    <>
      {showTitle && (
        <div
          role='dialog'
          aria-modal='true'
          aria-labelledby='modal-title'
          className={styles.modalOverlay}
        >
          {modalTemplate}
        </div>
      )}
      {!showTitle && (
        <div
          role='dialog'
          aria-modal='true'
          aria-label={title}
          className={styles.modalOverlay}
        >
          {modalTemplate}
        </div>
      )}
    </>
  )

  if (isBrowser) {
    const modalRoot = document.getElementById('modal-root')
    return modalRoot ? createPortal(modalContainer, modalRoot) : null
  } else {
    return null
  }
})

Modal.displayName = 'Modal'
export default Modal
