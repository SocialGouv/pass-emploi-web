import React, { ReactElement } from 'react'

import { EvenementListItem } from '../../interfaces/evenement'

export function CreateurEvenementLabel({
  evenement,
  idConseiller,
}: {
  evenement: EvenementListItem
  idConseiller: string
}): ReactElement {
  if (evenement.createur?.id === idConseiller) return <p>Vous</p>
  if (evenement.createur?.prenom)
    return (
      <p>
        {evenement.createur.prenom} {evenement.createur.nom}
      </p>
    )

  return (
    <p>
      --
      <span className='sr-only'>information non disponible</span>
    </p>
  )
}
