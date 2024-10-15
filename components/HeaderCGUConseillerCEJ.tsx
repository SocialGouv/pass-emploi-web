import React from 'react'

import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'

export default function HeaderCGUConseillerCEJ() {
  return (
    <header
      role='banner'
      className='flex justify-between items-center flex-col py-8 border-b border-solid border-primary_lighten mb-8'
    >
      <IllustrationComponent
        name={IllustrationName.LogoCEJ}
        role='img'
        className='mb-8 mx-auto h-[64px] w-[120px] fill-white'
        focusable={false}
        aria-label='contrat d’engagement jeune'
        title='contrat d’engagement jeune'
      />

      <h1 className='text-xl-bold text-primary mb-4'>
        Conditions générales d’utilisation
      </h1>
      <p className='text-m-bold mb-4'>Application conseiller CEJ</p>
      <p className='text-s-regular'>Version 3 – 03 juillet 2024</p>
    </header>
  )
}
