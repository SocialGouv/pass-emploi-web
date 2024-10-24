import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React from 'react'

import propsStatutsActions from 'components/action/propsStatutsActions'
import TagStatutAction from 'components/action/TagStatutAction'
import { TagCategorie } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TR from 'components/ui/Table/TR'
import { Action, StatutAction } from 'interfaces/action'
import { toLongMonthDate } from 'utils/date'

type ActionRowProps = {
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

  function statutAction(): string {
    if (actionEstEnRetard) return 'en retard'
    return `${propsStatutsActions[action.status].label}`
  }

  return (
    <TR isSelected={isChecked}>
      <TD className='relative'>
        <label className='absolute inset-0 z-20 cursor-pointer p-4'>
          <span className='sr-only'>
            Sélection {action.titre} {action.qualification?.libelle}
          </span>
          <input
            type='checkbox'
            checked={isChecked}
            title={`${isChecked ? 'Désélectionner' : 'Sélectionner'} ${
              action.titre
            }`}
            className='w-4 h-4 cursor-pointer'
            disabled={!actionEstTerminee}
            onChange={() => onSelection(action)}
          />
        </label>
      </TD>
      <TD className='rounded-l-base max-w-[400px]'>
        <span
          className={`flex items-baseline wrap text-ellipsis overflow-hidden ${!actionEstTerminee ? 'text-disabled' : ''} ${isChecked ? 'text-base-bold' : ''}`}
        >
          {action.titre}
        </span>
      </TD>
      <TD>
        <p className='flex flex-row items-center'>{dateEcheance}</p>
      </TD>
      <TD>
        <p className='flex items-baseline text-ellipsis wrap overflow-hidden max-w-[300px]'>
          <TagCategorie categorie={action.qualification?.libelle} />
        </p>
      </TD>
      <TD>
        <p className='flex items-center'>
          <TagStatutAction
            status={action.status}
            actionEstEnRetard={actionEstEnRetard}
          />
        </p>
      </TD>
      <TDLink
        href={`${pathPrefix}/${jeuneId}/actions/${action.id}`}
        label={`Voir le détail de l'action ${statutAction()} du ${dateEcheance} : ${action.titre}`}
      />
    </TR>
  )
}
