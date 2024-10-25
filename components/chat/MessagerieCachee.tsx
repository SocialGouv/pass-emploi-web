import React from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'

export function MessagerieCachee({
  permuterVisibiliteMessagerie,
}: {
  permuterVisibiliteMessagerie: () => void
}) {
  return (
    <div ref={(e) => e?.focus()} tabIndex={-1} className='p-2 overflow-y-auto'>
      <p className='text-center'>
        Vous avez désactivé l’affichage de la messagerie
      </p>
      <IconComponent
        name={IconName.VisibilityOff}
        aria-hidden={true}
        focusable={false}
        className='w-24 h-24 fill-white bg-grey_700 p-6 rounded-full my-4 m-auto'
      />
      <Button
        label='Rendre visible la messagerie'
        onClick={permuterVisibiliteMessagerie}
        style={ButtonStyle.PRIMARY}
        className='block mx-auto'
      >
        <IconComponent
          name={IconName.VisibilityOn}
          aria-hidden={true}
          focusable={false}
          className='w-4 h-4 mr-2'
        />
        Rendre visible la messagerie
      </Button>
    </div>
  )
}
