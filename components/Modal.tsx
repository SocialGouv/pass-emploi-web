import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import {
  FC,
  ForwardedRef,
  forwardRef,
  ReactNode,
  SVGProps,
  useImperativeHandle,
  useRef,
} from 'react'

import ModalContainer, {
  ModalContainerProps,
  ModalHandles as _ModalHandles,
} from 'components/ModalContainer'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'

export type ModalHandles = _ModalHandles
type ModalProps = Pick<ModalContainerProps, 'onClose'> & {
  title: string
  children: ReactNode
  titleIcon?: IconName
  titleIllustration?: IllustrationName | FC<SVGProps<SVGElement>>
  titleImageSrc?: string | StaticImport
}

function Modal(
  {
    children: modalContent,
    onClose,
    title,
    titleIcon,
    titleIllustration,
    titleImageSrc,
  }: ModalProps,
  ref: ForwardedRef<ModalHandles>
) {
  const modalContainerRef = useRef<ModalHandles>(null)
  useImperativeHandle(ref, () => modalContainerRef.current!)

  const modalTemplate = (
    <div className='rounded-large bg-white max-h-[90%] max-w-[min(90%,_620px)] overflow-auto p-3'>
      <div className='flex justify-end'>
        <button
          type='button'
          onClick={(e) => modalContainerRef.current!.closeModal(e)}
          className='p-2 border-none hover:bg-primary_lighten hover:rounded-full'
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
            className='w-16 h-16 m-auto fill-primary mb-8'
          />
        )}
        {titleIllustration && !isSVG(titleIllustration) && (
          <IllustrationComponent
            name={titleIllustration}
            focusable={false}
            aria-hidden={true}
            className='w-1/4 m-auto fill-primary [--secondary-fill:var(--color-primary_lighten)] mb-8'
          />
        )}
        {titleIllustration &&
          isSVG(titleIllustration) &&
          (() => {
            const TitleIllustration = titleIllustration
            return (
              <TitleIllustration
                focusable={false}
                aria-hidden={true}
                className='w-1/4 m-auto fill-primary [--secondary-fill:var(--color-primary_lighten)] mb-8'
              />
            )
          })()}
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

  return (
    <ModalContainer
      ref={modalContainerRef}
      onClose={onClose}
      label={{ id: 'modal-title' }}
    >
      {modalTemplate}
    </ModalContainer>
  )
}

export default forwardRef(Modal)

function isSVG(
  prop: string | FC<SVGProps<SVGElement>>
): prop is FC<SVGProps<SVGElement>> {
  return typeof prop !== 'string'
}
