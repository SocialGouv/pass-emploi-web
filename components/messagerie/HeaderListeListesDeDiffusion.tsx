import React, {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

type HeaderListeListesDeDiffusionProps = {
  onBack: () => void
}
function HeaderListeListesDeDiffusion(
  { onBack }: HeaderListeListesDeDiffusionProps,
  ref: ForwardedRef<{ focusRetour: Function }>
) {
  const retourRef = useRef<HTMLButtonElement>(null)
  useImperativeHandle(ref, () => ({
    focusRetour: () => retourRef.current!.focus(),
  }))

  return (
    <div className=' items-center mx-4 my-6 short:hidden'>
      <div className='pb-3'>
        <button
          ref={retourRef}
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
          <span className='text-s-regular'>Retour</span>
        </button>
        <h2 className='text-l-bold text-primary text-center my-6 grow layout_s:text-left layout_s:p-0 layout_base:my-3'>
          Mes listes de diffusion
        </h2>
      </div>
    </div>
  )
}
export default forwardRef(HeaderListeListesDeDiffusion)
