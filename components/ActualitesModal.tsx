import parse, { domToReact } from 'html-react-parser'
import React, { useRef } from 'react'
import sanitizeHtml from 'sanitize-html'

import { ModalHandles } from 'components/Modal'
import ModalContainer from 'components/ModalContainer'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { useActualites } from 'utils/actualitesContext'

interface ActualitesModalProps {
  onClose: () => void
}

export default function ActualitesModal({ onClose }: ActualitesModalProps) {
  const modalRef = useRef<ModalHandles>(null)
  const [actualites] = useActualites()

  function formaterTexteAvecTag(texteAFormater: string) {
    const texteAssaini = sanitizeHtml(texteAFormater, {
      disallowedTagsMode: 'recursiveEscape',
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    })

    const texteEnrichi = texteAssaini
      .replace(
        /{/g,
        "<span className='flex items-center w-fit text-s-medium text-accent_1 px-3 bg-accent_1_lighten whitespace-nowrap rounded-full'>"
      )
      .replace(/}/g, '</span>')

    return parse(texteEnrichi)
  }

  const modalTemplate = (
    <div className='rounded-l-l fixed right-0 bg-white h-full max-w-[min(90%,_620px)] min-w-[min(50%)] overflow-auto pb-3 shadow-m'>
      <div className='bg-primary p-3'>
        <div className='flex justify-end'>
          <button
            type='button'
            onClick={(e) => modalRef.current!.closeModal(e)}
            className='p-2 border-2 border-primary hover:border-white hover:rounded-l'
          >
            <IconComponent
              name={IconName.Close}
              role='img'
              focusable={false}
              aria-label='Fermer la fenêtre'
              className='w-6 h-6 fill-white'
            />
          </button>
        </div>
        <h2
          id='modal-title'
          className='text-l-bold text-white text-center flex-auto mb-4 whitespace-pre-line'
        >
          Actualités
        </h2>
      </div>

      <div className='p-6'>
        <div className='[&_a]:underline [&_a]:text-primary [&_img]:max-w-[200px] [&_img]:my-4 [&_h3]:font-bold [&_h3]:text-primary [&_h3]:my-4'>
          {formaterTexteAvecTag(actualites)}
        </div>
      </div>
    </div>
  )

  return (
    <ModalContainer
      ref={modalRef}
      onClose={onClose}
      label={{ id: 'modal-title' }}
    >
      {modalTemplate}
    </ModalContainer>
  )
}
