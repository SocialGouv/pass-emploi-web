import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import {
  TagModalite,
  TagPresence,
  TagType,
} from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TR from 'components/ui/Table/TR'
import { EvenementListItem } from 'interfaces/evenement'
import { toFrenchDuration, toFrenchTime, toLongMonthDate } from 'utils/date'

import { CreateurEvenementLabel } from './CreateurEvenementLabel'

interface EvenementRowProps {
  evenement: EvenementListItem
  idConseiller: string
}

export function EvenementRow({ evenement, idConseiller }: EvenementRowProps) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  const date = DateTime.fromISO(evenement.date)
  const longMonthDate = toLongMonthDate(date)
  const heure = toFrenchTime(date)
  const heureA11y = toFrenchTime(date, { a11y: true })
  const duree = toFrenchDuration(evenement.duree)
  const dureeA11y = toFrenchDuration(evenement.duree, { a11y: true })

  const urlRdv = pathPrefix + '/edition-rdv?idRdv=' + evenement.id
  const urlSessionMilo = '/agenda/sessions/' + evenement.id

  return (
    <TR className='auto-rows-auto auto-cols-auto'>
      <TD className='rounded-tl-base! rounded-bl-none! p-0! pt-2! pl-2! layout-base:rounded-l-base! layout-base:flex layout-base:flex-col layout-base:justify-center layout-base:p-2!'>
        <div className='text-m-bold'>{longMonthDate}</div>
        <div>
          <span aria-label={heureA11y}>{heure} - </span>
          <span className='inline-flex items-center'>
            <IconComponent
              name={IconName.ScheduleOutline}
              focusable={false}
              role='img'
              aria-labelledby={evenement.id + '--duree'}
              className='inline w-[1em] h-[1em] fill-current mr-1'
            />
            <span
              id={evenement.id + '--duree'}
              aria-label={'durée ' + dureeA11y}
            >
              {duree}
            </span>
          </span>
        </div>
      </TD>

      <TD className='row-start-2 rounded-bl-base pt-0! pb-2! pl-2! layout-base:row-start-1 layout-base:col-start-2 layout-base:rounded-none layout-base:justify-center layout-base:p-2!'>
        <div className='text-base-bold'>{evenement.titre}</div>
        <div className='mt-1 flex flex-col gap-2'>
          <TagType {...evenement} isSmallTag={true} />
          {evenement.modality && <TagModalite {...evenement} />}
        </div>
      </TD>

      <TD className='p-0! layout-base:p-2! layout-base:flex layout-base:flex-col layout-base:justify-center'>
        {evenement.futPresent}
        <div className='text-grey-800'>Créé par</div>
        <CreateurEvenementLabel
          evenement={evenement}
          idConseiller={idConseiller}
        />
      </TD>

      <TD>
        <TagPresence estPresent={evenement.futPresent} />
      </TD>

      <TDLink
        href={evenement.isSession ? urlSessionMilo : urlRdv}
        labelPrefix='Consulter l’événement du'
      />
    </TR>
  )
}
