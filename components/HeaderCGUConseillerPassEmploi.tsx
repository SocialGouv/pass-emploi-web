import React from 'react'

import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'

export default function HeaderCGUConseillerPassEmploi() {
  return (
    <header
      role='banner'
      className='flex justify-between items-center flex-col py-8 border-b border-solid border-primary_lighten mb-8'
    >
      <IllustrationComponent
        name={IllustrationName.LogoPassemploi}
        role='img'
        className='mb-8 mx-auto w-[95px] fill-primary_darken'
        focusable={false}
        aria-label='pass emploi'
        title='pass emploi'
      />

      <h1 className='text-xl-bold text-primary mb-4'>
        Conditions générales d’utilisation
      </h1>
      <p className='text-m-bold mb-4'>Application conseiller pass emploi</p>
      <p className='text-s-regular'>Version 4 – 04 octobre 2024</p>
    </header>
  )
}