import React from 'react'

import BulleMessageSensible from 'components/ui/Form/BulleMessageSensible'
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
}: {
  onBack: () => void
  labelRetour: string
  titre: string
  bookmarkIcon?: IconName
  bookmarkLabel?: string
  onClickBookMark?: () => void
  rechercheIcon?: IconName
  rechercheLabel?: string
  onClickRecherche?: () => void
}) {
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
        <div className='flex gap-4'>
          {rechercheIcon && (
            <button
              aria-label={rechercheLabel}
              className='border-none rounded-full bg-primary_lighten'
              onClick={onClickRecherche}
            >
              <IconComponent
                name={rechercheIcon}
                title={rechercheLabel}
                className='w-8 h-8 fill-primary'
              />
            </button>
          )}
          {bookmarkIcon && (
            <button
              aria-label={bookmarkLabel}
              className='border-none rounded-full bg-primary_lighten'
              onClick={onClickBookMark}
            >
              <IconComponent
                name={bookmarkIcon}
                title={bookmarkLabel}
                className='w-8 h-8 fill-primary'
              />
            </button>
          )}
        </div>
      </div>
      <div className='flex'>
        <BulleMessageSensible />
        <h2 className='w-full text-left text-primary text-m-bold ml-2'>
          {titre}
        </h2>
      </div>
    </div>
  )
}
