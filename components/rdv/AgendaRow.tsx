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
  const dureeA11y = toFrenchDuration(evenement.duree, {
    a11y: true,
  })

  const urlRdv = pathPrefix + '/edition-rdv?idRdv=' + evenement.id
  const urlSessionMilo = '/agenda/sessions/' + evenement.id

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

  return (
    <TR>
      <TD className='rounded-l-base'>
        <div className='text-m-bold'>{longMonthDate}</div>
        {heure} - <span className='sr-only'>durée {dureeA11y}</span>
        <span className='inline-flex items-center' aria-hidden={true}>
          <IconComponent
            name={IconName.ScheduleOutline}
            focusable={false}
            title='durée'
            className='inline w-[1em] h-[1em] fill-[currentColor] mr-1'
          />
          {duree}
        </span>
      </TD>

      <TD>
        <div className='text-base-bold'>{evenement.labelBeneficiaires}</div>
        <div className='mt-1 flex gap-2'>
          <TagType {...evenement} isSmallTag={true} />
          {evenement.modality && <TagModalite {...evenement} />}
        </div>
      </TD>

      <TD>
        <div className='text-grey_800'>créé par</div>
        <CreateurEvenementLabel
          evenement={evenement}
          idConseiller={conseiller.id}
        />
      </TD>

      <TD></TD>

      <TDLink
        href={evenement.isSession ? urlSessionMilo : urlRdv}
        label={`Consulter l’événement du ${longMonthDate} à ${heureA11y} avec ${evenement.labelBeneficiaires}`}
      />
    </TR>
  )
}

function CreateurEvenementLabel(
  evenement: EvenementListItem,
  idConseiller: string
): ReactElement {
  if (evenement.isSession && evenement.createur?.id === idConseiller)
    return <p>Vous</p>
  else if (evenement.createur?.prenom)
    return (
      <p>
        {evenement.createur.prenom} {evenement.createur.nom}
      </p>
    )
  else
    return (
      <p>
        --
        <span className='sr-only'>information non disponible</span>
      </p>
    )
}
