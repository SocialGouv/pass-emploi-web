import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
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

import IconComponent, { IconName } from './ui/IconComponent'

import { MODAL_ROOT_ID } from 'components/ids'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import styles from 'styles/components/Modal.module.css'

export type ModalHandles = {
  focus: () => void
  closeModal: (e: KeyboardEvent | MouseEvent) => void
}
type ModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
  titleIcon?: IconName
  titleIllustration?: IllustrationName
  titleImageSrc?: string | StaticImport
}

function Modal(props: ModalProps, ref: ForwardedRef<ModalHandles>) {
  const {
    children: modalContent,
    onClose,
    title,
    titleIcon,
    titleIllustration,
    titleImageSrc,
  } = props

  const modalRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => ({
    focus: () =>
      modalRef
        .current!.querySelector<HTMLButtonElement>('button:first-child')!
        .focus(),
    closeModal: handleClose,
  }))
  const [isBrowser, setIsBrowser] = useState(false)
  const previousFocusedElement = useRef<HTMLElement | null>(null)
  const keyListeners = useRef(
    new Map([
      ['Tab', handleTabKey],
      ['Escape', closeIfFocusInside],
    ])
  )

  function closeIfFocusInside(e: KeyboardEvent | MouseEvent) {
    if (!modalRef.current) return

    const focusableModalElements: NodeListOf<HTMLElement> =
      modalRef.current.querySelectorAll(
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
      className='rounded-l bg-white max-h-[90%] max-w-[min(90%,_620px)] overflow-auto p-3'
      ref={modalRef}
    >
      <div className='flex justify-end'>
        <button
          type='button'
          onClick={handleClose}
          ref={focusOnRender}
          className='p-2 border-none hover:bg-primary_lighten hover:rounded-l'
        >
          <IconComponent
            name={IconName.Close}
            role='img'
            focusable={false}
            aria-label='Fermer la fenêtre'
            className='w-6 h-6 fill-content_color'
          />
        </button>
      </div>

      <div className='px-6 pb-6'>
        {titleIcon && (
          <IconComponent
            name={titleIcon}
            focusable={false}
            aria-hidden={true}
            className='w-20 h-20 m-auto fill-primary mb-8'
          />
        )}
        {titleIllustration && (
          <IllustrationComponent
            name={titleIllustration}
            focusable={false}
            aria-hidden={true}
            className='w-1/3 m-auto fill-primary mb-8'
          />
        )}
        {titleImageSrc && (
          <Image
            src={titleImageSrc}
            alt=''
            aria-hidden={true}
            className='m-auto mb-8'
          />
        )}
        <h2
          id='modal-title'
          className='text-l-bold text-primary text-center flex-auto mb-4 whitespace-pre-line'
        >
          {title}
        </h2>
        {modalContent}
      </div>
    </div>
  )

  const modalContainer = (
    <div
      role='dialog'
      aria-modal={true}
      aria-labelledby='modal-title'
      className={styles.modalOverlay}
    >
      {modalTemplate}
    </div>
  )

  if (isBrowser) {
    const modalRoot = document.getElementById(MODAL_ROOT_ID)
    return modalRoot ? createPortal(modalContainer, modalRoot) : null
  } else {
    return null
  }
}

export default forwardRef(Modal)
