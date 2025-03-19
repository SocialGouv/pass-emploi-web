import React, { ChangeEvent, ReactElement } from 'react'

import { TagMetier } from 'components/ui/Indicateurs/Tag'
import SelectButton from 'components/ui/SelectButton'
import {
  AnimationCollective,
  estClos,
  EtatVisibilite,
} from 'interfaces/evenement'

export default function Visibilite({
  etatVisibilite,
  onChangerVisibliteSession,
  ...animationCollective
}: {
  etatVisibilite: EtatVisibilite
  onChangerVisibliteSession: (nouvelEtat: EtatVisibilite) => Promise<void>
} & AnimationCollective): ReactElement {
  if (!animationCollective.isSession)
    return (
      <TagMetier
        label='Visible'
        className='text-success bg-success-lighten px-2! py-1! text-xs! font-bold!'
      />
    )

  const selectId = animationCollective.id + '--visibilite'
  const { style } = etatsVisibilite[etatVisibilite]

  async function changerVisibiliteSession(e: ChangeEvent<HTMLSelectElement>) {
    if (estClos(animationCollective)) return

    const nouvelEtat = e.target.value
    await onChangerVisibliteSession(nouvelEtat as EtatVisibilite)
  }

  return (
    <>
      <label htmlFor={selectId} className='sr-only'>
        Visibilité de l’événement {animationCollective.titre}
      </label>
      <SelectButton
        id={selectId}
        onChange={changerVisibiliteSession}
        value={etatVisibilite}
        disabled={estClos(animationCollective)}
        className={`z-20 text-xs-bold ${style}`}
      >
        {Object.entries(etatsVisibilite).map(([etat, { label }]) => (
          <option key={etat} value={etat}>
            {label}
          </option>
        ))}
      </SelectButton>
    </>
  )
}

const etatsVisibilite: {
  [key in EtatVisibilite]: {
    label: string
    style: string
  }
} = {
  visible: {
    label: 'Visible',
    style: 'text-success border-success bg-success-lighten',
  },
  'non-visible': {
    label: 'Non visible',
    style: 'text-content-color border-grey-800 bg-grey-100',
  },
  'auto-inscription': {
    label: 'Auto-inscription',
    style: 'text-primary border-primary bg-primary-lighten',
  },
}
