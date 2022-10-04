import React from 'react'

import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'

export default function LienPartageOffre({
  idOffre,
  style,
}: {
  idOffre: string
  style: ButtonStyle
}) {
  return (
    <ButtonLink href={`/offres/${idOffre}/partage`} style={style}>
      <IconComponent
        name={IconName.Partage}
        className='w-4 h-4 mr-3'
        focusable={false}
        aria-hidden={true}
      />
      Partager <span className='sr-only'>offre numéro {idOffre}</span>
    </ButtonLink>
  )
}
