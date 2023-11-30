import React, { ReactNode } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

export type NumeroEtape = 1 | 2 | 3 | 4 | 5
type EtapeProps = {
  numero: NumeroEtape
  titre: string
  children: Exclude<ReactNode, string | number | boolean | null | undefined>
}

export function Etape(props: EtapeProps) {
  return (
    <fieldset className='flex flex-col mb-8'>
      <legend className='flex items-center text-m-bold text-grey_800 mb-4'>
        <IconComponent
          name={getIconNumero(props.numero)}
          role='img'
          focusable={false}
          aria-label={`Étape ${props.numero}`}
          className='mr-2 w-8 h-8'
        />
        <span className='sr-only'>{props.numero}</span> {props.titre}
      </legend>
      {props.children}
    </fieldset>
  )

  function getIconNumero(numero: NumeroEtape): IconName {
    switch (numero) {
      case 1:
        return IconName.NumberCircleOne
      case 2:
        return IconName.NumberCircleTwo
      case 3:
        return IconName.NumberCircleThree
      case 4:
        return IconName.NumberCircleFour
      case 5:
        return IconName.NumberCircleFive
    }
  }
}
