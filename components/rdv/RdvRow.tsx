import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import React, { ReactElement } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagMetier } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TR from 'components/ui/Table/TR'
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
  const router = useRouter()
  const pathPrefix = router.asPath.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  const date = DateTime.fromISO(rdv.date)
  const shortDate = toShortDate(date)
  const fullDate = toFrenchFormat(date, WEEKDAY_MONTH_LONG)
  const timeAndDuration = `${toFrenchFormat(date, TIME_24_H_SEPARATOR)} - ${
    rdv.duree
  } min`

  const labelBeneficiaires = beneficiaireUnique
    ? getNomJeuneComplet(beneficiaireUnique)
    : rdv.labelBeneficiaires

  const urlRdv = pathPrefix + '/edition-rdv?idRdv=' + rdv.id
  const urlRdvSessionMilo = '/agenda/sessions/' + rdv.id

  function tagType({
    isSession,
    type,
    source,
  }: EvenementListItem): ReactElement {
    let tagProps: {
      color: string
      iconName?: IconName
      iconLabel?: string
      background?: string
    } = {
      color: 'content_color',
      iconName: undefined,
      iconLabel: undefined,
      background: 'additional_5',
    }
    if (source === StructureConseiller.MILO)
      tagProps = {
        color: 'content_color',
        iconName: IconName.Lock,
        iconLabel: 'Non modifiable',
        background: 'additional_5',
      }

    if (isSession)
      tagProps = {
        color: 'accent_1',
        iconName: IconName.Lock,
        iconLabel: 'Informations de la session non modifiables',
        background: 'accent_1',
      }

    return (
      <TagMetier
        label={type}
        color={tagProps.color}
        backgroundColor={tagProps.background + '_lighten'}
        iconName={tagProps.iconName}
        iconLabel={tagProps.iconLabel}
      />
    )
  }

  return (
    <TR
      href={rdv.isSession ? urlRdvSessionMilo : urlRdv}
      label={`Consulter l’événement du ${fullDate} avec ${labelBeneficiaires}`}
    >
      <TD
        aria-label={withDate ? fullDate + ' - ' + timeAndDuration : ''}
        className='rounded-l-base'
      >
        {withDate && `${shortDate} - `}
        {timeAndDuration}
      </TD>

      {!beneficiaireUnique && <TD isBold>{rdv.labelBeneficiaires}</TD>}

      <TD>{tagType(rdv)}</TD>

      <TD>
        {!withIndicationPresenceBeneficiaire && (
          <>
            <IconComponent
              name={IconName.LocationOn}
              focusable={false}
              aria-hidden={true}
              className='inline mr-2 h-6 w-6 fill-primary'
            />
            {rdv.modality}
          </>
        )}

        {withIndicationPresenceBeneficiaire && (
          <>
            {rdv.futPresent === undefined && (
              <>
                - <span className='sr-only'>information non disponible</span>
              </>
            )}

            {rdv.futPresent !== undefined && (
              <>
                <IconComponent
                  name={
                    rdv.futPresent ? IconName.CheckCircleFill : IconName.Close
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
          </>
        )}
      </TD>

      <TD className='rounded-r-base'>
        <span className='flex items-center justify-between'>
          {rdv.idCreateur === idConseiller && (
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
          {rdv.idCreateur !== idConseiller && (
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
          <IconComponent
            name={IconName.ChevronRight}
            focusable={false}
            aria-hidden={true}
            className='w-6 h-6 fill-primary'
          />
        </span>
      </TD>
    </TR>
  )
}
