import {
  ForwardedRef,
  forwardRef,
  MouseEvent,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

import { MODAL_ROOT_ID } from 'components/globals'
import styles from 'styles/components/Modal.module.css'

export type ModalHandles = {
  focusClose: () => void
  closeModal: (e: KeyboardEvent | MouseEvent) => void
}
export type ModalContainerProps = {
  onClose: () => void
  children: ReactNode
  label: { id: string } | { value: string }
}

function ModalContainer(
  { children, onClose, label }: ModalContainerProps,
  ref: ForwardedRef<ModalHandles>
) {
  const modalContainerRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => ({
    focusClose,
    closeModal: handleClose,
  }))
  const [isRendered, setIsRendered] = useState(false)
  const previousFocusedElement = useRef<HTMLElement | null>(null)
  const keyListeners = useRef(
    new Map([
      ['Tab', handleTabKey],
      ['Escape', closeIfFocusInside],
    ])
  )

  function closeIfFocusInside(e: KeyboardEvent | MouseEvent) {
    if (!modalContainerRef.current) return

    const focusableModalElements: NodeListOf<HTMLElement> =
      modalContainerRef.current.querySelectorAll(
        'a[href], button, textarea, input, select'
      )
    if (
      Array.from(focusableModalElements).some(
        (element) => element === document.activeElement
      )
    ) {
      handleClose(e)
    }
  }

  function focusClose() {
    if (!previousFocusedElement.current)
      previousFocusedElement.current = document.activeElement as HTMLElement

    modalContainerRef
      .current!.querySelector<HTMLButtonElement>('button:first-child')!
      .focus()
  }

  function handleTabKey(e: KeyboardEvent) {
    if (!modalContainerRef.current) return

    const focusableModalElements: NodeListOf<HTMLElement> =
      modalContainerRef.current.querySelectorAll(
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

  function handleClose(e?: KeyboardEvent | MouseEvent) {
    e?.preventDefault()
    if (previousFocusedElement.current) previousFocusedElement.current.focus()
    onClose()
  }

  function keyListener(e: KeyboardEvent) {
    const listener = keyListeners.current.get(e.key)
    return listener && listener(e)
  }

  useEffect(() => {
    setIsRendered(true)
    document.addEventListener('keydown', keyListener)

    return () => document.removeEventListener('keydown', keyListener)
  }, [])

  useEffect(() => {
    if (isRendered) focusClose()
  }, [isRendered])

  const modalContainer = (
    <div
      ref={modalContainerRef}
      role='dialog'
      aria-modal={true}
      aria-labelledby={isExternal(label) ? label.id : undefined}
      aria-label={!isExternal(label) ? label.value : undefined}
      className={styles.modalOverlay}
    >
      {children}
    </div>
  )

  if (isRendered) {
    const modalRoot = document.getElementById(MODAL_ROOT_ID)
    return modalRoot ? createPortal(modalContainer, modalRoot) : null
  } else {
    return null
  }
}

function isExternal(title: { id: string } | any): title is { id: string } {
  return Object.prototype.hasOwnProperty.call(title, 'id')
}

export default forwardRef(ModalContainer)
