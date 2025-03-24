import React, {
  ForwardedRef,
  forwardRef,
  ReactElement,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

function HeaderChat(
  {
    labelRetour,
    onBack,
    onPermuterBookMark,
    isFlaggedByConseiller,
    onLancerRecherche,
    titre,
    onPermuterVisibiliteMessagerie,
    messagerieFullScreen,
    messagerieEstVisible,
    beneficiaire,
  }: {
    onBack: () => void
    labelRetour: string
    beneficiaire?: string
    messagerieEstVisible: boolean
    titre: string | ReactElement
    onPermuterVisibiliteMessagerie: () => void
    messagerieFullScreen?: boolean
    afficherBlurBtn?: boolean
    isFlaggedByConseiller?: boolean
    onPermuterBookMark?: () => void
    onLancerRecherche?: () => void
  },
  ref: ForwardedRef<{ focusRetour: () => void }>
) {
  const retourRef = useRef<HTMLButtonElement>(null)
  useImperativeHandle(ref, () => ({
    focusRetour: () => retourRef.current!.focus(),
  }))

  const [afficherMenuActionsMessagerie, setAfficherMenuActionsMessagerie] =
    useState<boolean>(false)

  function permuterMenuActionsMessagerie() {
    setAfficherMenuActionsMessagerie(!afficherMenuActionsMessagerie)
  }

  function permuterVisibiliteMessagerie() {
    setAfficherMenuActionsMessagerie(false)
    onPermuterVisibiliteMessagerie()
  }

  function rechercherMessage() {
    setAfficherMenuActionsMessagerie(false)
    onLancerRecherche!()
  }

  function permuterFlag() {
    setAfficherMenuActionsMessagerie(false)
    onPermuterBookMark!()
  }

  const flag =
    onPermuterBookMark &&
    (isFlaggedByConseiller
      ? { label: 'Ne plus suivre la conversation', icon: IconName.BookmarkFill }
      : { label: 'Suivre la conversation', icon: IconName.BookmarkOutline })

  return (
    <div className='items-center mx-4 my-6 short:hidden'>
      <div className='pb-3 flex items-center justify-between'>
        <button
          ref={retourRef}
          id='chat-bouton-retour'
          className={`border-none rounded-full mr-2 ${messagerieFullScreen ? '' : 'bg-primary-lighten'} flex items-center hover:text-primary focus:pr-2`}
          aria-label={labelRetour}
          onClick={onBack}
          type='button'
        >
          <IconComponent
            name={IconName.ArrowBackward}
            aria-hidden={true}
            focusable={false}
            className='w-5 h-5 fill-primary mr-3'
          />
          <span className='text-s-regular text-content underline'>Retour</span>
        </button>

        <div className='relative flex items-center gap-2 justify-end text-xs-medium text-content'>
          <button
            onClick={permuterMenuActionsMessagerie}
            type='button'
            className='bg-primary rounded-full fill-white hover:shadow-base'
            title={`${afficherMenuActionsMessagerie ? 'Cacher les' : 'Accéder aux'} actions de votre messagerie`}
          >
            <IconComponent
              focusable={false}
              aria-hidden={true}
              className='inline w-6 h-6 m-1'
              name={IconName.More}
            />
            <span className='sr-only'>
              {afficherMenuActionsMessagerie ? 'Cacher les' : 'Accéder aux'}{' '}
              actions de votre messagerie
            </span>
          </button>

          {afficherMenuActionsMessagerie && (
            <div className='absolute top-[4em] z-10 bg-white rounded-base p-2 shadow-m'>
              <button
                onClick={permuterVisibiliteMessagerie}
                className='p-2 flex items-center text-nowrap text-s-bold gap-2 hover:text-primary hover:fill-primary'
              >
                <IconComponent
                  name={
                    messagerieEstVisible
                      ? IconName.VisibilityOff
                      : IconName.VisibilityOn
                  }
                  className='inline w-6 h-6 fill-[current-color]'
                  focusable={false}
                  aria-hidden={true}
                />
                {messagerieEstVisible
                  ? 'Masquer la messagerie'
                  : 'Rendre visible la messagerie'}
              </button>

              {onLancerRecherche && (
                <button
                  className='p-2 flex items-center text-nowrap text-s-bold gap-2 hover:text-primary hover:fill-primary'
                  onClick={rechercherMessage}
                >
                  <IconComponent
                    name={IconName.Search}
                    className='inline w-6 h-6 fill-[current-color]'
                    focusable={false}
                    aria-hidden={true}
                  />
                  Rechercher un message
                </button>
              )}

              {onPermuterBookMark && (
                <button
                  className='p-2 flex items-center text-nowrap text-s-bold gap-2 hover:text-primary hover:fill-primary'
                  onClick={permuterFlag}
                >
                  <IconComponent
                    name={flag!.icon}
                    className='inline w-6 h-6 fill-[current-color]'
                    focusable={false}
                    aria-hidden={true}
                  />
                  {flag!.label}{' '}
                  <span className='sr-only'>avec {beneficiaire}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className='flex'>
        <h2 className='w-full text-left text-primary text-m-bold ml-2'>
          {titre}
        </h2>
      </div>
    </div>
  )
}

export default forwardRef(HeaderChat)
