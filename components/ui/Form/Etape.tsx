import React, { ReactNode } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

type NumeroEtape = 1 | 2 | 3 | 4
type EtapeProps = {
  numero: NumeroEtape
  titre: string
  children: Exclude<ReactNode, string | number | boolean | null | undefined>
}

export function Etape(props: EtapeProps) {
  return (
    <fieldset className='flex flex-col mb-8'>
      <legend className='flex items-center text-m-bold mb-4'>
        <IconComponent
          name={getIconNumero(props.numero)}
          role='img'
          focusable={false}
          aria-label={`Étape ${props.numero}`}
          className='mr-2 w-8 h-8'
        />
        {props.titre}
      </legend>
      {props.children}
    </fieldset>
  )

  function getIconNumero(numero: NumeroEtape): IconName {
    switch (numero) {
      case 1:
        return IconName.Chiffre1
      case 2:
        return IconName.Chiffre2
      case 3:
        return IconName.Chiffre3
      case 4:
        return IconName.Chiffre4
    }
  }
}
