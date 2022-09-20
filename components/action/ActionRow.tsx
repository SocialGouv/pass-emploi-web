import { DateTime } from 'luxon'
import Link from 'next/link'
import React, { useMemo } from 'react'

import StatusTag from 'components/action/StatusTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import RowCell from 'components/ui/Table/RowCell'
import { Action, StatutAction } from 'interfaces/action'
import { toShortDate } from 'utils/date'

interface ActionRowProps {
  action: Action
  jeuneId: string
}

export default function ActionRow({ action, jeuneId }: ActionRowProps) {
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
    <Link href={`/mes-jeunes/${jeuneId}/actions/${action.id}`}>
      <a
        role='row'
        aria-label={`Détail de l'action ${action.content}`}
        className={`table-row cursor-pointer focus-within:primary_lighten rounded-small shadow-s hover:bg-primary_lighten`}
      >
        <RowCell className='rounded-l-small'>
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
        </RowCell>
        <RowCell>
          <span className='flex items-center'>
            <span>{creationDate}</span>
          </span>
        </RowCell>
        <RowCell>
          <span className='flex flex-row items-center'>
            <span
              className={
                actionEstEnRetard
                  ? 'text-warning flex flex-row items-center'
                  : ''
              }
            >
              {actionEstEnRetard ? (
                <IconComponent
                  name={IconName.ImportantOutline}
                  aria-label='en retard'
                  aria-hidden='true'
                  focusable='false'
                  className='h-3 mr-1'
                />
              ) : (
                <></>
              )}
              {dateEcheance}
            </span>
          </span>
        </RowCell>
        <RowCell className='rounded-r-small w-[160px]'>
          <span className='flex items-center justify-between'>
            <StatusTag status={action.status} />
            <IconComponent
              name={IconName.ChevronRight}
              focusable='false'
              aria-hidden='true'
              className=' w-6 h-6 fill-content_color'
            />
          </span>
        </RowCell>
      </a>
    </Link>
  )
}
