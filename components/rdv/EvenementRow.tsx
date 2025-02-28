import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagType } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TR from 'components/ui/Table/TR'
import { EvenementListItem } from 'interfaces/evenement'
import {
  toFrenchDuration,
  toFrenchTime,
  toMonthday,
  toShortDate,
} from 'utils/date'

interface EvenementRowProps {
  evenement: EvenementListItem
  idConseiller: string
  withIndicationPresenceBeneficiaire?: boolean
}

export function EvenementRow({
  evenement,
  idConseiller,
  withIndicationPresenceBeneficiaire = false,
}: EvenementRowProps) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  const date = DateTime.fromISO(evenement.date)
  const shortDate = toShortDate(date)
  const fullDate = toMonthday(date)
  const timeAndDuration = `${toFrenchTime(date)} - ${toFrenchDuration(evenement.duree)}`
  const timeAndDurationA11y = `${toFrenchTime(date, { a11y: true })} - ${toFrenchDuration(evenement.duree, { a11y: true })}`

  const urlRdv = pathPrefix + '/edition-rdv?idRdv=' + evenement.id
  const urlSessionMilo = '/agenda/sessions/' + evenement.id

  return (
    <TR>
      <TD
        aria-label={fullDate + ' - ' + timeAndDurationA11y}
        className='rounded-l-base'
      >
        {shortDate} - {timeAndDuration}
      </TD>

      <TD>
        <TagType {...evenement} />
      </TD>

      <TD>
        {!withIndicationPresenceBeneficiaire && (
          <>
            <IconComponent
              name={IconName.LocationOn}
              focusable={false}
              aria-hidden={true}
              className='inline mr-2 h-6 w-6 fill-primary'
            />
            {evenement.modality}
          </>
        )}

        {withIndicationPresenceBeneficiaire && (
          <>
            {evenement.futPresent === undefined && (
              <>
                - <span className='sr-only'>information non disponible</span>
              </>
            )}

            {evenement.futPresent !== undefined && (
              <>
                <IconComponent
                  name={
                    evenement.futPresent
                      ? IconName.CheckCircleFill
                      : IconName.Close
                  }
                  focusable={false}
                  aria-hidden={true}
                  className={`inline mr-2 h-6 w-6 ${
                    evenement.futPresent ? 'fill-success' : 'fill-alert'
                  }`}
                />
                {evenement.futPresent ? 'Oui' : 'Non'}
              </>
            )}
          </>
        )}
      </TD>

      <TD className='rounded-r-base'>
        <IconComponent
          name={
            evenement.createur?.id === idConseiller
              ? IconName.CheckCircleFill
              : IconName.Cancel
          }
          aria-hidden={true}
          focusable={false}
          className='inline mr-2 h-6 w-6 fill-primary'
        />
        {evenement.createur?.id === idConseiller ? 'oui' : 'non'}
      </TD>

      <TDLink
        href={evenement.isSession ? urlSessionMilo : urlRdv}
        labelPrefix='Consulter l’événement du'
      />
    </TR>
  )
}
