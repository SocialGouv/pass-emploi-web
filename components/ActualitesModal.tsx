import React, { useRef } from 'react'

import ModalContainer, { ModalHandles } from 'components/ModalContainer'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Article, ArticleCouleur } from 'interfaces/actualites'
import { useActualites } from 'utils/actualitesContext'

interface ActualitesModalProps {
  onClose: () => void
}

export default function ActualitesModal({ onClose }: ActualitesModalProps) {
  const modalRef = useRef<ModalHandles>(null)
  const actualites = useActualites()

  const aDesActualites = Boolean(actualites && actualites.length > 0)

  const modalTemplate = (
    <div className='rounded-l-large fixed right-0 bg-primary_lighten h-full max-w-[min(90%,_620px)] min-w-[min(30%)] overflow-auto pb-3 shadow-m'>
      <div className='bg-primary p-3'>
        <div className='flex justify-end'>
          <button
            type='button'
            onClick={(e) => modalRef.current!.closeModal(e)}
            className='p-2 border-2 border-primary hover:border-white hover:rounded-full'
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

      {!aDesActualites && (
        <div className='bg-white px-4 py-2 rounded-base m-4 text-center text-grey_800'>
          Vous n’avez pas d’actualités en cours
        </div>
      )}

      {aDesActualites && (
        <div className='p-6'>
          {actualites?.map((article) => (
            <ArticleActualitees key={article.id} article={article} />
          ))}
        </div>
      )}
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

function ArticleActualitees({ article }: { article: Article }) {
  return (
    <article className='bg-white px-4 py-2 rounded-base mb-4 [&_a]:underline [&_a]:text-primary [&_a]:hover:text-primary_darken [&_img]:max-w-[200px] [&_img]:my-4 [&_p]:text-grey_800'>
      <header>
        <h3 className='font-bold text-primary my-2'>{article.titre}</h3>

        {article.etiquettes.length > 0 && (
          <div className='flex gap-2'>
            <span className='sr-only'>Catégories : </span>
            {article.etiquettes.map((etiquette) => (
              <span
                key={etiquette.id}
                className={`flex items-center w-fit text-s-medium px-3 ${etiquette.couleur ? stylesEtiquettes[etiquette.couleur] : ''} whitespace-nowrap rounded-large`}
              >
                {etiquette.nom}
              </span>
            ))}
          </div>
        )}
      </header>

      {article.contenu}
    </article>
  )
}

const stylesEtiquettes: { [key in ArticleCouleur]: string } = {
  primary: 'text-primary bg-primary_ligthen',
  warning: 'text-warning bg-warning_lighten',
}
