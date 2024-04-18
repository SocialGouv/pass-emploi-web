import React from 'react'

import { TagCategorieAction } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TR from 'components/ui/Table/TR'
import { ActionPilotage } from 'interfaces/action'
import { toLongMonthDate } from 'utils/date'

interface ActionRowPilotageProps {
  action: ActionPilotage
  isChecked: boolean
  onSelection: (action: ActionPilotage) => void
}

export default function ActionRowPilotage({
  action,
  isChecked,
  onSelection,
}: ActionRowPilotageProps) {
  const dateFinReelle = toLongMonthDate(action.dateFinReelle)

  return (
    <TR
      href={`/mes-jeunes/${action.beneficiaire.id}/actions/${action.id}`}
      label={`Accéder au détail de l’action : ${action.titre}`}
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
            action.titre
          }`}
          className='w-4 h-4 cursor-pointer'
          aria-label={`Sélection ${action.titre} ${
            action.categorie?.libelle ?? ''
          }`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onChange={() => onSelection(action)}
        />
      </TD>
      <TD isBold={isChecked}>
        {action.beneficiaire.nom} {action.beneficiaire.prenom}
      </TD>
      <TD isBold>{action.titre}</TD>
      <TD>
        <TagCategorieAction categorie={action.categorie?.libelle} />
      </TD>
      <TD>
        <span className='flex flex-row'>{dateFinReelle}</span>
      </TD>
    </TR>
  )
}
