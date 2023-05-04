import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

type ListeListesDeDiffusionProps = {
  onBack: () => void
}
export default function HeaderListeListesDeDiffusion({
  onBack,
}: ListeListesDeDiffusionProps) {
  return (
    <div className=' items-center mx-4 my-6 short:hidden'>
      <div className='pb-3 flex items-center justify-between'>
        <button
          className='border-none rounded-full mr-2 bg-primary_lighten flex items-center hover:text-primary'
          aria-label={'Retour sur ma messagerie'}
          onClick={onBack}
        >
          <IconComponent
            name={IconName.ArrowBackward}
            aria-hidden={true}
            focusable={false}
            className='w-5 h-5 fill-primary mr-3'
          />
          <h2 className='text-l-bold text-primary text-center my-6 grow layout_s:text-left layout_s:p-0 layout_base:my-3'>
            Messagerie
          </h2>
        </button>
      </div>
    </div>
  )
}
