import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagType } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TR from 'components/ui/Table/TR'
import {
  BaseBeneficiaire,
  getNomBeneficiaireComplet,
} from 'interfaces/beneficiaire'
import { EvenementListItem } from 'interfaces/evenement'
import { toFrenchTime, toMonthday, toShortDate } from 'utils/date'

interface EvenementRowProps {
  evenement: EvenementListItem
  idConseiller: string
  beneficiaire: BaseBeneficiaire
  withIndicationPresenceBeneficiaire?: boolean
}

export function EvenementRow({
  evenement,
  idConseiller,
  beneficiaire,
  withIndicationPresenceBeneficiaire = false,
}: EvenementRowProps) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  const date = DateTime.fromISO(evenement.date)
  const shortDate = toShortDate(date)
  const fullDate = toMonthday(date)
  const timeAndDuration = `${toFrenchTime(date)} - ${evenement.duree} min`

  const labelBeneficiaires = getNomBeneficiaireComplet(beneficiaire)

  const urlRdv = pathPrefix + '/edition-rdv?idRdv=' + evenement.id
  const urlSessionMilo = '/agenda/sessions/' + evenement.id

  return (
    <TR>
      <TD
        aria-label={fullDate + ' - ' + timeAndDuration}
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
                  className={`inline mr-2 h-6 w-6 fill-${
                    evenement.futPresent ? 'success' : 'alert'
                  }`}
                />
                {evenement.futPresent ? 'Oui' : 'Non'}
              </>
            )}
          </>
        )}
      </TD>

      <TD className='rounded-r-base'>
        {evenement.idCreateur === idConseiller && (
          <>
            <span className='sr-only'>oui</span>
            <IconComponent
              name={IconName.CheckCircleFill}
              aria-hidden={true}
              focusable={false}
              className='h-6 fill-primary'
            />
          </>
        )}
        {evenement.idCreateur !== idConseiller && (
          <>
            <span className='sr-only'>non</span>
            <IconComponent
              name={IconName.Cancel}
              aria-hidden={true}
              focusable={false}
              className='h-6 fill-grey_700'
            />
          </>
        )}
      </TD>
      <TDLink
        href={evenement.isSession ? urlSessionMilo : urlRdv}
        label={`Consulter l’événement du ${fullDate} avec ${labelBeneficiaires}`}
      />
    </TR>
  )
}
