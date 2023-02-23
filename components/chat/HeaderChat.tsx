import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

export default function HeaderChat(props: {
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
        onClick={props.onBack}
      >
        <IconComponent
          name={IconName.ChevronLeft}
          role='img'
          focusable={false}
          aria-label={props.labelRetour}
          title={props.labelRetour}
          className='w-6 h-6 fill-primary'
        />
      </button>
      <h2 className='w-full text-left text-primary text-l-bold'>
        {props.titre}
      </h2>
      {props.iconName && (
        <button
          aria-label={props.iconLabel}
          className='p-3 border-none rounded-full mr-2 bg-primary_lighten'
          onClick={props.onClickIcon}
        >
          <IconComponent
            name={props.iconName}
            title={props.iconLabel}
            className='w-6 h-6 fill-primary'
          />
        </button>
      )}
    </div>
  )
}
