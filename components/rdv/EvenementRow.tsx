import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React, { ReactElement } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagMetier } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TR from 'components/ui/Table/TR'
import {
  BaseBeneficiaire,
  getNomBeneficiaireComplet,
} from 'interfaces/beneficiaire'
import { StructureConseiller } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import { toShortDate, toFrenchTime, toMonthday } from 'utils/date'

interface EvenementRowProps {
  evenement: EvenementListItem
  idConseiller: string
  beneficiaireUnique?: BaseBeneficiaire
  withDate?: boolean
  withIndicationPresenceBeneficiaire?: boolean
}

export function EvenementRow({
  evenement,
  idConseiller,
  beneficiaireUnique,
  withDate,
  withIndicationPresenceBeneficiaire = false,
}: EvenementRowProps) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  const date = DateTime.fromISO(evenement.date)
  const shortDate = toShortDate(date)
  const fullDate = toMonthday(date)
  const timeAndDuration = `${toFrenchTime(date)} - ${evenement.duree} min`

  const labelBeneficiaires = beneficiaireUnique
    ? getNomBeneficiaireComplet(beneficiaireUnique)
    : evenement.labelBeneficiaires

  const urlRdv = pathPrefix + '/edition-rdv?idRdv=' + evenement.id
  const urlSessionMilo = '/agenda/sessions/' + evenement.id

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
      href={evenement.isSession ? urlSessionMilo : urlRdv}
      linkLabel={`Consulter l’événement du ${fullDate} avec ${labelBeneficiaires}`}
      rowLabel={`${fullDate} - ${evenement.type} avec ${labelBeneficiaires}`}
    >
      <TD
        aria-label={withDate ? fullDate + ' - ' + timeAndDuration : ''}
        className='rounded-l-base'
      >
        {withDate && `${shortDate} - `}
        {timeAndDuration}
      </TD>

      {!beneficiaireUnique && <TD isBold>{evenement.labelBeneficiaires}</TD>}

      <TD>{tagType(evenement)}</TD>

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
    </TR>
  )
}
