import React from 'react'

import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'

type LoginHeaderProps = {
  title: string
  subtitle: string
}
export default function LoginHeader({ title, subtitle }: LoginHeaderProps) {
  return (
    <>
      <div className='flex justify-center gap-8'>
        <IllustrationComponent
          name={IllustrationName.LogoCEJ}
          className='h-[60px]'
          focusable={false}
          aria-hidden={true}
        />

        <IllustrationComponent
          name={IllustrationName.LogoPassemploi}
          className='h-[60px] fill-primary_darken'
          focusable={false}
          aria-hidden={true}
        />
      </div>

      <header role='banner' className='my-8'>
        <h1 className='text-xl-bold text-primary_darken text-center mb-8'>
          {title}
        </h1>
        <p className='text-m-regular text-primary_darken text-center'>
          {subtitle}
        </p>
      </header>
    </>
  )
}
