import React from 'react'

import IllustrationLogoCEJ from 'assets/images/logo_app_cej.svg'

export default function HeaderCGUConseillerCEJ() {
  return (
    <header
      role='banner'
      className='flex justify-between items-center flex-col py-8 border-b border-solid border-primary_lighten mb-8'
    >
      <IllustrationLogoCEJ
        className='mb-8 mx-auto h-[64px] w-[120px]'
        focusable={false}
        aria-hidden={true}
      />

      <h1 className='text-xl-bold text-primary mb-4'>
        Conditions générales d’utilisation
      </h1>
      <p className='text-m-bold mb-4'>Application conseiller CEJ</p>
      <p className='text-s-regular'>Version 4 – 29 janvier 2025</p>
    </header>
  )
}
