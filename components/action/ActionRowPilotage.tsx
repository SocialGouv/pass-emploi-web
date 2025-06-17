import React from 'react'

import { TagCategorie } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
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
    <TR isSelected={isChecked}>
      <TD className='relative'>
        <label className='absolute inset-0 z-20 cursor-pointer p-4 self-center'>
          <span className='sr-only'>
            Sélection {action.titre} {action.categorie?.libelle}
          </span>
          <input
            type='checkbox'
            checked={isChecked}
            title={`${isChecked ? 'Désélectionner' : 'Sélectionner'} ${
              action.titre
            }`}
            className='w-4 h-4 cursor-pointer'
            onChange={() => onSelection(action)}
          />
        </label>
      </TD>
      <TD isBold={isChecked}>
        {action.beneficiaire.nom} {action.beneficiaire.prenom}
      </TD>
      <TD isBold>
        <TagCategorie categorie={action.categorie?.libelle} />
        {dateFinReelle}
      </TD>
      <TD>
        <span className='text-base-bold'>{action.titre}</span>
        {action.description && (
          <p className='line-clamp-2'>{action.description}</p>
        )}
      </TD>
      <TDLink
        href={`/mes-jeunes/${action.beneficiaire.id}/actions/${action.id}`}
        labelPrefix='Accéder au détail de l’action de'
      />
    </TR>
  )
}
