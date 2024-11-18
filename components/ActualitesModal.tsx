import parse from 'html-react-parser'
import React, { useRef } from 'react'
import sanitizeHtml from 'sanitize-html'

import ModalContainer, { ModalHandles } from 'components/ModalContainer'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { useActualites } from 'utils/actualitesContext'

interface ActualitesModalProps {
  onClose: () => void
}

export default function ActualitesModal({ onClose }: ActualitesModalProps) {
  const modalRef = useRef<ModalHandles>(null)
  const actualites = useActualites()

  function formaterActus(texteAFormater: string) {
    const texteAssaini = sanitizeHtml(texteAFormater, {
      disallowedTagsMode: 'recursiveEscape',
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    })

    const texteDecoupeParActu = decouperParActu(texteAssaini)
    const texteAvecCategorie = ajouterTagCategorie(texteDecoupeParActu)

    return parse(texteAvecCategorie)
  }

  function decouperParActu(str: string) {
    return str
      .replace(
        /<h3/g,
        "<div className='bg-white px-4 py-2 rounded-base mb-4'><h3"
      )
      .replace(/<hr \/>/g, '</div>')
  }

  function ajouterTagCategorie(str: string) {
    const divRegex = /<div\b[^>]*>([.\s\S]*?)<\/div>/g
    const codeRegex = /<code\b[^>]*>([.\s\S]*?)<\/code>/

    return Array.from(str.matchAll(divRegex))
      .map((article) => {
        const articleContent = article[1]

        const baliseCode = articleContent.match(codeRegex)

        if (!baliseCode) return articleContent

        const baliseCodeContent = baliseCode[1]

        const tags = baliseCodeContent.split(',').map((word) => word.trim())

        const categories = tags
          .map((tag) => {
            return `<span className='flex items-center w-fit text-s-medium text-additional_3 px-3 bg-additional_3_lighten whitespace-nowrap rounded-full'>${tag}</span>`
          })
          .join('')

        return articleContent.replace(
          /<pre\b[^>]*>[.\s\S]*?<\/pre>/g,
          `<div className='flex gap-2'>${categories}</div>`
        )
      })
      .map(
        (match) =>
          `<div className='bg-white px-4 py-2 rounded-base mb-4'>${match}</div></div>`
      )
      .join('')
  }

  const modalTemplate = (
    <div className='rounded-l-l fixed right-0 bg-white h-full max-w-[min(90%,_620px)] min-w-[min(30%)] overflow-auto pb-3 shadow-m'>
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

      <div className='p-6 bg-primary_lighten'>
        <div className='[&_a]:underline [&_a]:text-primary [&_img]:max-w-[200px] [&_img]:my-4 [&_h3]:font-bold [&_h3]:text-primary [&_h3]:my-2 [&_p]:text-grey_800'>
          {formaterActus(actualites?.contenu ?? '')}
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
