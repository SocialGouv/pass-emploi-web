import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React from 'react'

import TagStatutAction from 'components/action/TagStatutAction'
import { TagCategorie } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TR from 'components/ui/Table/TR'
import { Action, StatutAction } from 'interfaces/action'
import { toLongMonthDate } from 'utils/date'

type ActionBeneficiaireRowProps = {
  action: Action
  avecQualification?: {
    isChecked: boolean
    onSelection: (action: Action) => void
  }
}

export default function ActionBeneficiaireRow({
  action,
  avecQualification,
}: ActionBeneficiaireRowProps) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  const actionEstEnRetard =
    DateTime.fromISO(action.dateEcheance) < DateTime.now() &&
    action.status === StatutAction.AFaire

  const actionAQualifier = action.status === StatutAction.TermineeAQualifier

  const dateEcheance = toLongMonthDate(action.dateEcheance)

  return (
    <TR isSelected={avecQualification?.isChecked}>
      {avecQualification && (
        <TD className='relative'>
          {actionAQualifier && (
            <label className='absolute inset-0 z-20 cursor-pointer p-4'>
              <span className='sr-only'>
                Sélection {action.titre} {action.qualification?.libelle}
              </span>
              <input
                type='checkbox'
                checked={avecQualification.isChecked}
                title={`${avecQualification.isChecked ? 'Désélectionner' : 'Sélectionner'} ${
                  action.titre
                }`}
                className='w-4 h-4 cursor-pointer'
                onChange={() => avecQualification.onSelection(action)}
              />
            </label>
          )}
        </TD>
      )}
      <TD className='rounded-l-base max-w-[400px]'>
        <span
          className={`flex items-baseline wrap text-ellipsis overflow-hidden ${avecQualification?.isChecked ? 'text-base-bold' : ''}`}
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
        href={`${pathPrefix}/${action.beneficiaire.id}/actions/${action.id}`}
        labelPrefix='Voir le détail de l’action'
      />
    </TR>
  )
}
