import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React from 'react'

import TagStatutAction from 'components/action/TagStatutAction'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagCategorieAction } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TR from 'components/ui/Table/TR'
import { Action, StatutAction } from 'interfaces/action'
import { MONTH_LONG, toFrenchFormat, toShortDate } from 'utils/date'

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

  const dateEcheance = toFrenchFormat(
    DateTime.fromISO(action.dateEcheance),
    MONTH_LONG
  )

  return (
    <TR
      href={`${pathPrefix}/${jeuneId}/actions/${action.id}`}
      label={`Détail de l'action ${action.content}`}
      isSelected={isChecked}
    >
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
          onClick={(e) => {
            e.stopPropagation()
          }}
          onChange={() => onSelection(action)}
        />
      </TD>
      <TD className='rounded-l-base max-w-[400px]'>
        <div className='flex items-center'>
          {action.status === StatutAction.Qualifiee &&
            action.qualification?.isSituationNonProfessionnelle && (
              <IconComponent
                role='img'
                focusable={false}
                name={IconName.Suitcase}
                aria-label='Qualifiée en Situation Non Professionnelle'
                title='SNP'
                className='w-4 h-4 fill-accent_2 mr-2'
              />
            )}
          <span
            className={`flex items-baseline wrap text-ellipsis overflow-hidden ${!actionEstTerminee ? 'text-disabled' : ''} ${isChecked ? 'text-base-bold' : ''}`}
          >
            {action.content}
          </span>
        </div>
      </TD>
      <TD>
        <span className='flex flex-row items-center'>{dateEcheance}</span>
      </TD>
      <TD>
        <span className='flex items-baseline text-ellipsis wrap overflow-hidden max-w-[300px]'>
          <TagCategorieAction categorie={action.qualification?.libelle} />
        </span>
      </TD>
      <TD className='rounded-r-base w-[160px]'>
        <span className='flex items-center justify-between'>
          <TagStatutAction
            status={action.status}
            actionEstEnRetard={actionEstEnRetard}
          />
          <IconComponent
            name={IconName.ChevronRight}
            focusable='false'
            aria-hidden='true'
            className=' w-6 h-6 fill-primary'
          />
        </span>
      </TD>
    </TR>
  )
}
