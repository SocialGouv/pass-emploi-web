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

import IconComponent, { IconName } from './ui/IconComponent'

import styles from 'styles/components/Modal.module.css'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  showTitle?: boolean
  customHeight?: string
  customWidth?: string
  iconName?: any
  iconHead?: boolean
}

const Modal = forwardRef((props: ModalProps, ref) => {
  const {
    children: modalContent,
    customHeight,
    customWidth,
    onClose,
    showTitle = true,
    title,
    iconHead,
    iconName,
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
      className='rounded-x_large bg-blanc max-w-[620px]'
      style={{
        height: customHeight,
        width: customWidth,
      }}
      ref={modalRef}
    >
      <div className='flex justify-end p-5'>
        <button
          type='button'
          onClick={handleClose}
          ref={focusOnRender}
          className='p-3 border-none hover:bg-primary_lighten hover:rounded-full'
        >
          <IconComponent
            name={IconName.Close}
            role='img'
            focusable='false'
            aria-label='Fermer la fenêtre'
            className='w-6 h-6 fill-content_color'
          />
        </button>
      </div>
      <div className='px-5 pt-3 pb-8'>
        {iconHead && (
          <IconComponent
            name={iconName}
            focusable={false}
            aria-hidden={true}
            className='w-[100px] h-[91px] m-auto mb-8 fill-primary'
          />
        )}
        {showTitle && (
          <h1
            id='modal-title'
            className='text-base-medium text-content_color text-center flex-auto mb-4'
          >
            {title}
          </h1>
        )}
        {modalContent}
      </div>
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
