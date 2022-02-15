import React from 'react'
import { ActionJeune } from 'interfaces/action'
import ActionRow from './ActionRow'
import { Jeune } from 'interfaces/jeune'

interface TableauActionsJeuneProps {
  jeune: Jeune
  actions: ActionJeune[]
  hideTableHead?: boolean
}

export const TableauActionsJeune = ({
  jeune,
  actions,
  hideTableHead = false,
}: TableauActionsJeuneProps) => {
  const styles = 'border-solid border-0 border-b-2 border-b-grey_700'

  return (
    <table className='w-full'>
      <caption className='sr-only'>
        Liste des actions de {jeune.firstName} {jeune.lastName}
      </caption>
      <thead className={hideTableHead ? 'sr-only' : ''}>
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
          <ActionRow key={action.id} action={action} jeuneId={jeune.id} />
        ))}
      </tbody>
    </table>
  )
}
