import React from 'react'

import IllustrationLogoCEJ from 'assets/images/logo_app_cej.svg'
import IllustrationLogoPassemploi from 'assets/images/logo_pass_emploi.svg'

type LoginHeaderProps = {
  title: string
  subtitle?: string
}
export default function LoginHeader({ title, subtitle }: LoginHeaderProps) {
  return (
    <>
      <div className='flex justify-center gap-8'>
        <IllustrationLogoCEJ
          className='h-[60px]'
          focusable={false}
          aria-hidden={true}
        />

        <IllustrationLogoPassemploi
          className='h-[60px]'
          focusable={false}
          aria-hidden={true}
        />
      </div>

      <header role='banner' className='my-8'>
        <h1 className='text-xl-bold text-primary_darken text-center'>
          {title}
        </h1>
        {subtitle && (
          <p className='text-m-regular text-primary_darken text-center mt-8'>
            {subtitle}
          </p>
        )}
      </header>
    </>
  )
}
