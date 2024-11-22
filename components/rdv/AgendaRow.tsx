import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React, { ReactElement } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagStatut, TagType } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TR from 'components/ui/Table/TR'
import { EvenementListItem } from 'interfaces/evenement'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toFrenchDuration, toFrenchTime, toLongMonthDate } from 'utils/date'

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
    <TR className='grid grid-cols-subgrid grid-rows-[repeat(2,auto) layout_base:grid-rows-[auto] col-span-full'>
      <TD className='!rounded-tl-base !rounded-bl-none !p-0 !pt-2 !pl-2 layout_base:!rounded-l-base layout_base:flex layout_base:flex-col layout_base:justify-center layout_base:!p-2'>
        <div className='text-m-bold'>{longMonthDate}</div>
        <div>
          {heure} -{' '}
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

      <TD className='row-start-2 rounded-bl-base !pt-0 !pb-2 !pl-2 layout_base:row-start-1 layout_base:col-start-2 layout_base:rounded-none layout_base:justify-center layout_base:!p-2'>
        <div className='text-base-bold'>{evenement.labelBeneficiaires}</div>
        <div className='mt-1 flex flex-col gap-2'>
          <TagType {...evenement} isSmallTag={true} />
          {evenement.modality && <TagModalite {...evenement} />}
        </div>
      </TD>

      <TD className='col-start-2 !p-0 layout_base:col-start-3 layout_base:!p-2 layout_base:flex layout_base:flex-col layout_base:justify-center'>
        <div className='text-grey_800'>créé par</div>
        <CreateurEvenementLabel
          evenement={evenement}
          idConseiller={conseiller.id}
        />
      </TD>

      <TD className='row-start-2 !p-0 !pb-2 layout_base:row-start-1 layout_base:col-start-4 layout_base:flex layout_base:items-center layout_base:justify-center layout_base:!p-2'>
        <Inscrits evenement={evenement} />
      </TD>

      <TDLink
        className='row-span-2 flex items-center justify-center !p-2 !pl-4 layout_base:row-span-1 layout_base:!p-2'
        href={evenement.isSession ? urlSessionMilo : urlRdv}
        label={`Consulter l’événement du ${longMonthDate} à ${heureA11y} avec ${evenement.labelBeneficiaires}`}
      />
    </TR>
  )
}

function CreateurEvenementLabel({
  evenement,
  idConseiller,
}: {
  evenement: EvenementListItem
  idConseiller: string
}): ReactElement {
  if (evenement.createur?.id === idConseiller) return <p>Vous</p>
  if (evenement.createur?.prenom)
    return (
      <p>
        {evenement.createur.prenom} {evenement.createur.nom}
      </p>
    )

  return (
    <p>
      --
      <span className='sr-only'>information non disponible</span>
    </p>
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
        <span className='text-m-bold'>{nombreParticipants}</span> inscrit
        {aPlusieursParticipants ? 's' : ''}
      </p>
    )
  else if (aUneCapaciteLimite && aAtteintLaCapaciteLimite)
    return <p className='text-base-bold text-warning'>Complet</p>
  else
    return (
      <p>
        <span className='text-m-bold'>{nombreParticipants}</span> inscrit
        {nombreParticipants !== 1 ? 's' : ''} /{maxParticipants}
      </p>
    )
}

function TagModalite({ modality }: EvenementListItem): ReactElement {
  return (
    <TagStatut
      backgroundColor='primary_lighten'
      color='primary'
      label={modality!}
      className='!px-2 !py-1 !text-xs !font-bold [&>svg]:!w-4 [&>svg]:!h-4'
    />
  )
}
