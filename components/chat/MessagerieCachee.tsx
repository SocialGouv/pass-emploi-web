import React from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'

export function MessagerieCachee({
  permuterVisibiliteMessagerie,
}: {
  permuterVisibiliteMessagerie: () => void
}) {
  return (
    <div className='flex flex-col gap-4 justify-center p-2'>
      <p className='text-center'>
        Vous avez désactivé l’affichage de la messagerie
      </p>
      <IconComponent
        name={IconName.VisibilityOff}
        aria-hidden={true}
        focusable={false}
        className='w-24 h-24 fill-blanc bg-grey_700 p-6 rounded-full my-4 m-auto'
      />
      <Button
        label='Rendre visible la messagerie'
        onClick={permuterVisibiliteMessagerie}
        style={ButtonStyle.PRIMARY}
        className='mx-auto'
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
