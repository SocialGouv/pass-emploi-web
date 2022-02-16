import React from 'react'
import { ActionJeune } from 'interfaces/action'
import ActionRow from './ActionRow'

interface TableauActionsJeuneProps {
  prenom: string
  nom: string
  jeuneId: string
  actions: ActionJeune[]
}

export const TableauActionsJeune = ({
  prenom,
  nom,
  jeuneId,
  actions,
}: TableauActionsJeuneProps) => {
  const styles = 'border-solid border-0 border-b-2 border-b-grey_700'

  return (
    <table className='w-full'>
      <caption className='sr-only'>
        Liste des actions de {prenom} {nom}
      </caption>
      <thead>
        <tr className='text-xs-medium text-grey_800'>
          <th
            scope='col'
            className=' pl-4 py-4 border-solid border-0 border-b-2 border-b-grey_700'
          >
            Intitulé de l&apos;action
          </th>
          <th scope='col' className={styles}>
            Créée le
          </th>
          <th scope='col' className={styles}>
            Statut
          </th>
        </tr>
      </thead>

      <tbody>
        {actions.map((action: ActionJeune) => (
          <ActionRow key={action.id} action={action} jeuneId={jeuneId} />
        ))}
      </tbody>
    </table>
  )
}
