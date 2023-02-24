import React from 'react'

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
    <div className='flex items-center mx-4 pb-6 my-6 border-b border-grey_500 short:hidden'>
      <button
        className='p-3 border-none rounded-full mr-2 bg-primary_lighten'
        onClick={onBack}
      >
        <IconComponent
          name={IconName.ChevronLeft}
          role='img'
          focusable={false}
          aria-label={labelRetour}
          title={labelRetour}
          className='w-6 h-6 fill-primary'
        />
      </button>
      <h2 className='w-full text-left text-primary text-l-bold'>{titre}</h2>
      {iconName && (
        <button
          aria-label={iconLabel}
          className='p-3 border-none rounded-full mr-2 bg-primary_lighten'
          onClick={onClickIcon}
        >
          <IconComponent
            name={iconName}
            title={iconLabel}
            className='w-6 h-6 fill-primary'
          />
        </button>
      )}
    </div>
  )
}
