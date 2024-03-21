import React from 'react'

import LogoCEJ from 'assets/images/logo_app_cej.svg'
import LogoPassEmploi from 'assets/images/logo_pass_emploi.svg'
import { Conseiller, estPoleEmploiBRSA } from 'interfaces/conseiller'

type HeaderCGUProps = {
  conseiller: Conseiller
}

export default function HeaderCGU({ conseiller }: HeaderCGUProps) {
  return (
    <header
      role='banner'
      className='flex justify-between items-center flex-col py-8 border-b border-solid border-primary_lighten mb-8'
    >
      {estPoleEmploiBRSA(conseiller) && (
        <LogoPassEmploi
          role='img'
          className='mb-8 mx-auto fill-primary_darken'
          focusable={false}
          aria-label='pass emploi'
          title='pass emploi'
        />
      )}

      {!estPoleEmploiBRSA(conseiller) && (
        <LogoCEJ
          role='img'
          className='mb-8 mx-auto h-[64px] w-[120px] fill-blanc'
          focusable={false}
          aria-label='contrat d’engagement jeune'
          title='contrat d’engagement jeune'
        />
      )}
      <h1 className='text-xl-bold text-primary mb-4'>
        Conditions générales d’utilisation
      </h1>
      <p className='text-m-bold mb-4'>
        Application conseiller{' '}
        {estPoleEmploiBRSA(conseiller) ? 'pass emploi' : 'CEJ'}
      </p>
      <p className='text-s-regular'>Version 4 – 19 décembre 2022</p>
    </header>
  )
}
