import React, { ReactElement, useState } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

export default function HeaderChat({
  bookmarkLabel,
  bookmarkIcon,
  rechercheIcon,
  labelRetour,
  onBack,
  onClickBookMark,
  onClickRecherche,
  rechercheLabel,
  titre,
  permuterVisibiliteMessagerie,
  messagerieEstVisible,
}: {
  onBack: () => void
  labelRetour: string
  messagerieEstVisible: boolean
  permuterVisibiliteMessagerie: () => void
  afficherBlurBtn?: boolean
  titre: string | ReactElement
  bookmarkIcon?: IconName
  bookmarkLabel?: string
  onClickBookMark?: () => void
  rechercheIcon?: IconName
  rechercheLabel?: string
  onClickRecherche?: () => void
}) {
  const [afficherMenuActionsMessagerie, setAfficherMenuActionsMessagerie] =
    useState<boolean>(false)
  function permuterMenuActionsMessagerie() {
    setAfficherMenuActionsMessagerie(!afficherMenuActionsMessagerie)
  }

  return (
    <div className='items-center mx-4 my-6 short:hidden'>
      <div className='pb-3 flex items-center justify-between'>
        <button
          className='border-none rounded-full mr-2 bg-primary_lighten flex items-center hover:text-primary focus:pr-2'
          aria-label={labelRetour}
          onClick={onBack}
        >
          <IconComponent
            name={IconName.ArrowBackward}
            aria-hidden={true}
            focusable={false}
            className='w-5 h-5 fill-primary mr-3'
          />
          <span className='text-s-regular text-content underline'>Retour</span>
        </button>
        <div
          onClick={permuterMenuActionsMessagerie}
          className='relative flex items-center gap-2 justify-end text-xs-medium text-content'
        >
          <button
            type='button'
            className='bg-primary rounded-full fill-blanc hover:shadow-base'
            title={`${afficherMenuActionsMessagerie ? 'Cacher' : 'Voir'} les actions possibles pour votre messagerie`}
          >
            <IconComponent
              focusable={false}
              aria-hidden={true}
              className='inline w-6 h-6 m-1'
              name={IconName.More}
            />
            <span className='sr-only'>
              {afficherMenuActionsMessagerie ? 'Cacher' : 'Voir'} les actions
              possibles pour votre messagerie
            </span>
          </button>

          {afficherMenuActionsMessagerie && (
            <div className='absolute top-[4em] z-10 bg-blanc rounded-base p-2 shadow-m'>
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
              {rechercheIcon && (
                <button
                  aria-label={rechercheLabel}
                  className='p-2 flex items-center text-nowrap text-s-bold gap-2 hover:text-primary hover:fill-primary'
                  onClick={onClickRecherche}
                >
                  <IconComponent
                    name={rechercheIcon}
                    className='inline w-6 h-6 fill-[current-color]'
                    focusable={false}
                    aria-hidden={true}
                  />
                  {rechercheLabel}
                </button>
              )}
              {bookmarkIcon && (
                <button
                  aria-label={bookmarkLabel}
                  className='p-2 flex items-center text-nowrap text-s-bold gap-2 hover:text-primary hover:fill-primary'
                  onClick={onClickBookMark}
                >
                  <IconComponent
                    name={bookmarkIcon}
                    title={bookmarkLabel}
                    className='inline w-6 h-6 fill-[current-color]'
                    focusable={false}
                    aria-hidden={true}
                  />
                  {bookmarkLabel}
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
