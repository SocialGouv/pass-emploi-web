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
        className='text-success bg-success_lighten px-2! py-1! text-xs! font-bold!'
      />
    )

  const selectId = id + '--visibilite'
  const { style } = etatsVisibilite[etatVisibilite]

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
    style: 'text-success border-success bg-success_lighten',
  },
  'non-visible': {
    label: 'Non visible',
    style: 'text-content_color border-grey_800 bg-grey_100',
  },
  'auto-inscription': {
    label: 'Auto-inscription',
    style: 'text-primary border-primary bg-primary_lighten',
  },
}
