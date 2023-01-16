import { DateTime } from 'luxon'
import React, { useMemo } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import TD from 'components/ui/Table/TD'
import { TR } from 'components/ui/Table/TR'
import { StructureConseiller } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import { BaseJeune, getNomJeuneComplet } from 'interfaces/jeune'
import {
  TIME_24_H_SEPARATOR,
  toFrenchFormat,
  toShortDate,
  WEEKDAY_MONTH_LONG,
} from 'utils/date'

interface RdvRowProps {
  rdv: EvenementListItem
  idConseiller: string
  beneficiaireUnique?: BaseJeune
  withDate?: boolean
  withIndicationPresenceBeneficiaire?: boolean
}

export function RdvRow({
  rdv,
  idConseiller,
  beneficiaireUnique,
  withDate,
  withIndicationPresenceBeneficiaire = false,
}: RdvRowProps) {
  const date = useMemo(() => DateTime.fromISO(rdv.date), [rdv.date])
  const shortDate = useMemo(() => toShortDate(date), [date])
  const fullDate = useMemo(
    () => toFrenchFormat(date, WEEKDAY_MONTH_LONG),
    [date]
  )
  const timeAndDuration = useMemo(
    () => `${toFrenchFormat(date, TIME_24_H_SEPARATOR)} - ${rdv.duree} min`,
    [date, rdv.duree]
  )
  const labelBeneficiaires = beneficiaireUnique
    ? getNomJeuneComplet(beneficiaireUnique)
    : rdv.labelBeneficiaires

  function getRdvIconName(evenement: EvenementListItem) {
    if (evenement.source === StructureConseiller.MILO) {
      return IconName.Lock
    }
  }

  function isLabelTypeAnimationCollective(label?: string): boolean {
    return label === 'Atelier' || label === 'Information collective'
  }

  return (
    <TR
      href={'/mes-jeunes/edition-rdv?idRdv=' + rdv.id}
      label={`Consulter l’événement du ${fullDate} avec ${labelBeneficiaires}`}
    >
      <TD
        aria-label={withDate ? fullDate + ' - ' + timeAndDuration : ''}
        className='rounded-l-base'
      >
        {withDate && `${shortDate} - `}
        {timeAndDuration}
      </TD>

      {!beneficiaireUnique && <TD>{rdv.labelBeneficiaires}</TD>}

      <TD>
        <DataTag
          text={rdv.type}
          style='additional'
          iconName={getRdvIconName(rdv)}
          iconLabel='Non modifiable'
        />
      </TD>

      <TD>
        {!withIndicationPresenceBeneficiaire && (
          <>
            <IconComponent
              name={IconName.Location}
              focusable={false}
              aria-hidden={true}
              className='inline mr-2 h-6 w-6 fill-primary'
            />
            {rdv.modality}
          </>
        )}

        {withIndicationPresenceBeneficiaire &&
          isLabelTypeAnimationCollective(rdv.type) && (
            <>
              <IconComponent
                name={
                  rdv.futPresent
                    ? IconName.RoundedCheckFilled
                    : IconName.RoundedCloseFilled
                }
                focusable={false}
                aria-hidden={true}
                className={`inline mr-2 h-6 w-6 fill-${
                  rdv.futPresent ? 'success' : 'alert'
                }`}
              />
              {rdv.futPresent ? 'Oui' : 'Non'}
            </>
          )}

        {withIndicationPresenceBeneficiaire &&
          !isLabelTypeAnimationCollective(rdv.type) && (
            <>
              - <span className='sr-only'>information non disponible</span>
            </>
          )}
      </TD>

      <TD className='rounded-r-base'>
        <span className='flex items-center justify-between'>
          {rdv.idCreateur === idConseiller && (
            <>
              <span className='sr-only'>oui</span>
              <IconComponent
                name={IconName.RoundedCheckFilled}
                aria-hidden={true}
                focusable={false}
                className='h-3 fill-primary'
              />
            </>
          )}
          {rdv.idCreateur !== idConseiller && (
            <>
              <span className='sr-only'>non</span>
              <IconComponent
                name={IconName.Ko}
                aria-hidden={true}
                focusable={false}
                className='h-3'
              />
            </>
          )}
          <IconComponent
            name={IconName.ChevronRight}
            focusable={false}
            aria-hidden={true}
            className='w-6 h-6 fill-content_color'
          />
        </span>
      </TD>
    </TR>
  )
}
