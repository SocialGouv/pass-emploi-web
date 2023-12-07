import React from 'react'

import BulleMessageSensible from 'components/ui/Form/BulleMessageSensible'
import IconComponent, { IconName } from 'components/ui/IconComponent'

export default function HeaderChat({
  iconLabel,
  iconName,
  labelRetour,
  onBack,
  onClickIcon,
  titre,
}: {
  onBack: () => void
  labelRetour: string
  titre: string
  iconName?: IconName
  iconLabel?: string
  onClickIcon?: () => void
}) {
  return (
    <div className=' items-center mx-4 my-6 short:hidden'>
      <div className='pb-3 flex items-center justify-between'>
        <button
          className='border-none rounded-full mr-2 bg-primary_lighten flex items-center hover:text-primary'
          aria-label={labelRetour}
          onClick={onBack}
        >
          <IconComponent
            name={IconName.ArrowBackward}
            aria-hidden={true}
            focusable={false}
            className='w-5 h-5 fill-primary mr-3'
          />
          <span className='text-s-regular text-content underline hover:text-primar'>
            Retour
          </span>
        </button>
        {iconName && (
          <button
            aria-label={iconLabel}
            className='border-none rounded-full bg-primary_lighten'
            onClick={onClickIcon}
          >
            <IconComponent
              name={iconName}
              title={iconLabel}
              className='w-8 h-8 fill-primary'
            />
          </button>
        )}
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
