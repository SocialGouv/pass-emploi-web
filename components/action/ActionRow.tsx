import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import React from 'react'

import TagStatutAction from 'components/action/TagStatutAction'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagCategorieAction } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TR from 'components/ui/Table/TR'
import { Action, StatutAction } from 'interfaces/action'
import { toShortDate } from 'utils/date'

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
  const router = useRouter()
  const pathPrefix = router.asPath.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  const actionEstEnRetard =
    DateTime.fromISO(action.dateEcheance) < DateTime.now() &&
    action.status === StatutAction.EnCours

  const actionEstTerminee = action.status === StatutAction.Terminee

  const dateEcheance = toShortDate(action.dateEcheance)

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
      <TD className='rounded-l-base'>
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
            className={`flex items-baseline wrap text-base-bold text-ellipsis overflow-hidden max-w-[400px] ${!actionEstTerminee ? 'text-disabled' : ''}`}
          >
            {action.content}
          </span>
        </div>
      </TD>
      <TD>
        <span className='flex flex-row items-center'>{dateEcheance}</span>
      </TD>
      <TD>
        <span className='flex flex-row items-center'>
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
