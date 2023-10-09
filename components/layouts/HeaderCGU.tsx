import React from 'react'

import LogoCEJ from 'assets/images/logo_app_cej.svg'
import LogoPassEmploi from 'assets/images/logo_pass_emploi.svg'
import { Conseiller, estPoleEmploiBRSA } from 'interfaces/conseiller'

interface HeaderCGUProps {
  conseiller: Conseiller
  pageHeader: string
}
export default function HeaderCGU({ conseiller, pageHeader }: HeaderCGUProps) {
  return (
    <header className='flex justify-between items-center flex-col py-8 border-b border-solid border-primary_lighten mb-8'>
      {estPoleEmploiBRSA(conseiller) && (
        <LogoPassEmploi
          className='mb-8 mx-auto fill-primary_darken'
          focusable={false}
          aria-hidden={false}
          aria-label='pass emploi'
          title='pass emploi'
        />
      )}

      {!estPoleEmploiBRSA(conseiller) && (
        <LogoCEJ
          role='img'
          focusable={false}
          aria-label='contrat d’engagement jeune'
          title='contrat d’engagement jeune'
          className='mb-8 mx-auto h-[64px] w-[120px] fill-blanc'
        />
      )}
      <h1 className='text-xl-bold text-primary mb-4'>{pageHeader}</h1>
      <p className='text-m-bold mb-4'>Application conseiller pass emploi</p>
      <p className='text-s-regular'>Version 1.1 – Mars 2024</p>
    </header>
  )
}
