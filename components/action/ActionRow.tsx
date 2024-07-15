import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React from 'react'

import TagStatutAction from 'components/action/TagStatutAction'
import { TagCategorieAction } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TR from 'components/ui/Table/TR'
import { Action, StatutAction } from 'interfaces/action'
import { toLongMonthDate } from 'utils/date'

interface ActionRowProps {
  action: Action
  jeuneId: string
  isChecked: boolean
  onSelection: (action: Action) => void
}

export default function ActionRow({
  action,
  jeuneId,
  isChecked,
  onSelection,
}: ActionRowProps) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  const actionEstEnRetard =
    DateTime.fromISO(action.dateEcheance) < DateTime.now() &&
    action.status === StatutAction.AFaire

  const actionEstTerminee = action.status === StatutAction.Terminee

  const dateEcheance = toLongMonthDate(action.dateEcheance)

  return (
    <TR isSelected={isChecked}>
      <TD
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onSelection(action)
        }}
      >
        <input
          id={`selectionner-${action.id}`}
          type='checkbox'
          checked={isChecked}
          title={`${isChecked ? 'Désélectionner' : 'Sélectionner'} ${
            action.content
          }`}
          className='w-4 h-4 cursor-pointer'
          aria-label={`Sélection ${action.content} ${
            action.qualification?.libelle ?? ''
          }`}
          disabled={!actionEstTerminee}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onSelection(action)}
        />
      </TD>
      <TD className='rounded-l-base max-w-[400px]'>
        <span
          className={`flex items-center items-baseline wrap text-ellipsis overflow-hidden ${!actionEstTerminee ? 'text-disabled' : ''} ${isChecked ? 'text-base-bold' : ''}`}
        >
          {action.content}
        </span>
      </TD>
      <TD>
        <span className='flex flex-row items-center'>{dateEcheance}</span>
      </TD>
      <TD>
        <span className='flex items-baseline text-ellipsis wrap overflow-hidden max-w-[300px]'>
          <TagCategorieAction categorie={action.qualification?.libelle} />
        </span>
      </TD>
      <TD>
        <span className='flex items-center'>
          <TagStatutAction
            status={action.status}
            actionEstEnRetard={actionEstEnRetard}
          />
        </span>
      </TD>
      <TDLink
        href={`${pathPrefix}/${jeuneId}/actions/${action.id}`}
        label={`Voir le détail de l'action ${action.content}`}
      />
    </TR>
  )
}
