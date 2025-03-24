import React from 'react'

import IllustrationLogoPassemploi from 'assets/images/logo_pass_emploi.svg'

export default function HeaderCGUConseillerPassEmploi() {
  return (
    <header
      role='banner'
      className='flex justify-between items-center flex-col py-8 border-b border-solid border-primary-lighten mb-8'
    >
      <IllustrationLogoPassemploi
        className='mb-8 mx-auto w-[95px]'
        focusable={false}
        aria-hidden={true}
      />

      <h1 className='text-xl-bold text-primary mb-4'>
        Conditions générales d’utilisation
      </h1>
      <p className='text-m-bold mb-4'>Application conseiller pass emploi</p>
      <p className='text-s-regular'>Version 5 – 10 mars 2025</p>
    </header>
  )
}
