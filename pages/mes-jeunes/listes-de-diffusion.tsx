import React from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'

export default function ListesDiffusion() {
  return (
    <div className='mx-auto my-0 flex flex-col items-center'>
      <EmptyStateImage
        aria-hidden={true}
        focusable={false}
        className='w-[360px] h-[200px] mb-16'
      />
      <p className='text-base-bold mb-12'>
        Vous n’avez aucune liste de diffusion.
      </p>
    </div>
  )
}
