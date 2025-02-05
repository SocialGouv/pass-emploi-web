import React, { ReactElement } from 'react'

import { TagMetier } from 'components/ui/Indicateurs/Tag'
import SelectButton from 'components/ui/SelectButton'
import { AnimationCollective, EtatVisibilite } from 'interfaces/evenement'

export default function Visibilite({
  id,
  isSession,
  titre,
  etatVisibilite,
  onChangerVisibliteSession,
}: {
  etatVisibilite: EtatVisibilite
  onChangerVisibliteSession: (nouvelEtat: EtatVisibilite) => Promise<void>
} & AnimationCollective): ReactElement {
  if (!isSession)
    return (
      <TagMetier
        label='Visible'
        color='success'
        backgroundColor='success_lighten'
        className='!px-2 !py-1 !text-xs !font-bold'
      />
    )

  const selectId = id + '--visibilite'
  const props = propsEtatsVisibilite[etatVisibilite]

  return (
    <>
      <label htmlFor={selectId} className='sr-only'>
        Visibilité de l’événement {titre}
      </label>
      <SelectButton
        id={selectId}
        onChange={(e) =>
          onChangerVisibliteSession(e.target.value as EtatVisibilite)
        }
        value={etatVisibilite}
        className={`z-20 text-xs-bold text-${props.textColor} border-${props.borderColor} bg-${props.bgColor}`}
      >
        {Object.entries(propsEtatsVisibilite).map(([etat, { label }]) => (
          <option key={etat} value={etat}>
            {label}
          </option>
        ))}
      </SelectButton>
    </>
  )
}

const propsEtatsVisibilite: {
  [key in EtatVisibilite]: {
    label: string
    textColor: string
    borderColor: string
    bgColor: string
  }
} = {
  visible: {
    label: 'Visible',
    textColor: 'success',
    borderColor: 'success',
    bgColor: 'success_lighten',
  },
  'non-visible': {
    label: 'Non visible',
    textColor: 'content_color',
    borderColor: 'grey_800',
    bgColor: 'grey_100',
  },
  'auto-inscription': {
    label: 'Auto-inscription',
    textColor: 'primary',
    borderColor: 'primary',
    bgColor: 'primary_lighten',
  },
}
