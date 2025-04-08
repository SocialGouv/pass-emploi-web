import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React, { ReactElement } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagModalite, TagType } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TR from 'components/ui/Table/TR'
import { EvenementListItem } from 'interfaces/evenement'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toFrenchDuration, toFrenchTime, toLongMonthDate } from 'utils/date'

import { CreateurEvenementLabel } from './CreateurEvenementLabel'

export function AgendaRow({ evenement }: { evenement: EvenementListItem }) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  const [conseiller] = useConseiller()
  const date = DateTime.fromISO(evenement.date)
  const longMonthDate = toLongMonthDate(date)
  const heure = toFrenchTime(date)
  const heureA11y = toFrenchTime(date, { a11y: true })
  const duree = toFrenchDuration(evenement.duree)
  const dureeA11y = toFrenchDuration(evenement.duree, { a11y: true })

  const urlRdv = pathPrefix + '/edition-rdv?idRdv=' + evenement.id
  const urlSessionMilo = '/agenda/sessions/' + evenement.id

  return (
    <TR className='grid grid-cols-subgrid grid-rows-[repeat(2,auto) layout-base:grid-rows-[auto] col-span-full'>
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
        <div className='text-base-bold'>{evenement.labelBeneficiaires}</div>
        <div className='mt-1 flex flex-col gap-2'>
          <TagType {...evenement} isSmallTag={true} />
          {evenement.modality && <TagModalite {...evenement} />}
        </div>
      </TD>

      <TD className='col-start-2 p-0! layout-base:col-start-3 layout-base:p-2! layout-base:flex layout-base:flex-col layout-base:justify-center'>
        <div className='text-grey-800'>créé par</div>
        <CreateurEvenementLabel
          evenement={evenement}
          idConseiller={conseiller.id}
        />
      </TD>

      <TD className='row-start-2 p-0! pb-2! layout-base:row-start-1 layout-base:col-start-4 layout-base:flex layout-base:items-center layout-base:justify-center layout-base:p-2!'>
        <Inscrits evenement={evenement} />
      </TD>

      <TDLink
        className='row-span-2 flex items-center justify-center p-2! pl-4! layout-base:row-span-1 layout-base:p-2!'
        href={evenement.isSession ? urlSessionMilo : urlRdv}
        labelPrefix='Consulter l’événement du'
      />
    </TR>
  )
}

function Inscrits({
  evenement,
}: {
  evenement: EvenementListItem
}): ReactElement {
  const nombreParticipants = evenement.beneficiaires!.length
  const maxParticipants = evenement.nombreMaxParticipants

  const aUneCapaciteLimite = maxParticipants !== undefined
  const aAtteintLaCapaciteLimite = nombreParticipants >= maxParticipants!
  const aPlusieursParticipants = nombreParticipants !== 1

  if (!aUneCapaciteLimite)
    return (
      <p>
        <span className='text-m-bold'>{nombreParticipants}</span>{' '}
        {aPlusieursParticipants ? 'inscrits' : 'inscrit'}
      </p>
    )
  else if (aUneCapaciteLimite && aAtteintLaCapaciteLimite)
    return <p className='text-base-bold text-warning'>Complet</p>
  else
    return (
      <p>
        <span className='text-m-bold'>{nombreParticipants}</span>{' '}
        {nombreParticipants !== 1 ? 'inscrits' : 'inscrit'} /{maxParticipants}
      </p>
    )
}
