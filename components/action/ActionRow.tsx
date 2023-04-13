import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'

import TagStatutAction from 'components/action/TagStatutAction'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import TD from 'components/ui/Table/TD'
import { TR } from 'components/ui/Table/TR'
import { Action, StatutAction } from 'interfaces/action'
import { toShortDate } from 'utils/date'

interface ActionRowProps {
  action: Action
  jeuneId: string
}

export default function ActionRow({ action, jeuneId }: ActionRowProps) {
  const router = useRouter()
  const pathPrefix = router.asPath.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  const actionEstEnRetard = useMemo(() => {
    return (
      action.status !== StatutAction.Annulee &&
      action.status !== StatutAction.Terminee &&
      DateTime.fromISO(action.dateEcheance) < DateTime.now()
    )
  }, [action])
  const creationDate = useMemo(
    () => toShortDate(action.creationDate),
    [action.creationDate]
  )
  const dateEcheance: string = useMemo(
    () => toShortDate(action.dateEcheance),
    [action.dateEcheance]
  )

  return (
    <TR
      href={`${pathPrefix}/${jeuneId}/actions/${action.id}`}
      label={`Détail de l'action ${action.content}`}
    >
      <TD className='rounded-l-base'>
        <div className='flex items-center'>
          {action.qualification?.isSituationNonProfessionnelle && (
            <IconComponent
              role='img'
              focusable={false}
              name={IconName.Suitcase}
              aria-label='Qualifiée en Situation Non Professionnelle'
              title='SNP'
              className='w-4 h-4 fill-accent_2 mr-2'
            />
          )}
          <span className='text-base-bold text-ellipsis overflow-hidden max-w-[400px] whitespace-nowrap'>
            {action.content}
          </span>
        </div>
      </TD>
      <TD>
        <span className='flex items-center'>
          <span>{creationDate}</span>
        </span>
      </TD>
      <TD>
        <span className='flex flex-row items-center'>
          <span
            className={
              actionEstEnRetard ? 'text-warning flex flex-row items-center' : ''
            }
          >
            {actionEstEnRetard ? (
              <IconComponent
                name={IconName.Error}
                aria-label='en retard'
                aria-hidden='true'
                focusable='false'
                className='h-3 mr-1 fill-warning'
              />
            ) : (
              <></>
            )}
            {dateEcheance}
          </span>
        </span>
      </TD>
      <TD className='rounded-r-base w-[160px]'>
        <span className='flex items-center justify-between'>
          <TagStatutAction status={action.status} />
          <IconComponent
            name={IconName.ChevronRight}
            focusable='false'
            aria-hidden='true'
            className=' w-6 h-6 fill-content_color'
          />
        </span>
      </TD>
    </TR>
  )
}
