import Link from 'next/link'
import React from 'react'

import KoIcon from '../../assets/icons/ko.svg'
import LocationIcon from '../../assets/icons/location.svg'
import { HeaderColumnCell } from '../ui/Table/HeaderColumnCell'
import TableLayout from '../ui/Table/TableLayout'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { RdvTypeTag } from 'components/ui/Indicateurs/RdvTypeTag'
import CellRow from 'components/ui/Table/CellRow'
import { RdvListItem } from 'interfaces/rdv'
import { formatDayDate, formatHourMinuteDate } from 'utils/date'

type TableauRdvProps = {
  rdvs: RdvListItem[]
  idConseiller: string
  withNameJeune?: boolean
}

export default function TableauRdv({
  rdvs,
  idConseiller,
  withNameJeune = true,
}: TableauRdvProps) {
  const dayHourCells = (rdvDate: Date, duration: number) => {
    return `${formatDayDate(rdvDate)} (${formatHourMinuteDate(
      rdvDate
    )} - ${duration} min)`
  }

  return (
    <>
      {rdvs.length === 0 && (
        <p className='text-base-regular mb-2'>
          Vous n’avez pas de rendez-vous pour le moment
        </p>
      )}

      {rdvs.length > 0 && (
        <TableLayout describedBy='table-caption'>
          <div id='table-caption' className='sr-only'>
            Liste de mes rendez-vous
          </div>
          <div role='rowgroup' className='table-row-group'>
            <div role='row' className='table-row'>
              <HeaderColumnCell>Horaires</HeaderColumnCell>
              {withNameJeune && <HeaderColumnCell>Prénom Nom</HeaderColumnCell>}
              <HeaderColumnCell>Type</HeaderColumnCell>
              <HeaderColumnCell>Modalité</HeaderColumnCell>
              <HeaderColumnCell>Créé par vous</HeaderColumnCell>
            </div>
          </div>

          <div role='rowgroup' className='table-row-group'>
            {rdvs.map((rdv: RdvListItem) => (
              <Link
                href={'/mes-jeunes/edition-rdv?idRdv=' + rdv.id}
                key={rdv.id}
              >
                <a
                  role='row'
                  key={rdv.id}
                  aria-label={`Modifier rendez-vous du ${rdv.date} avec ${rdv.beneficiaires}`}
                  className='table-row text-base-regular rounded-small shadow-s hover:bg-primary_lighten'
                >
                  <CellRow className='rounded-l-small'>
                    {dayHourCells(new Date(rdv.date), rdv.duration)}
                  </CellRow>
                  {withNameJeune && <CellRow>{rdv.beneficiaires}</CellRow>}

                  <CellRow>
                    <RdvTypeTag type={rdv.type} />
                  </CellRow>

                  <CellRow>
                    <LocationIcon
                      focusable='false'
                      aria-hidden='true'
                      className='mr-2 inline'
                    />
                    {rdv.modality}
                  </CellRow>

                  {rdv.idCreateur && (
                    <CellRow className='rounded-r-small'>
                      <span className='flex items-center justify-between'>
                        {rdv.idCreateur === idConseiller && (
                          <>
                            <span className='sr-only'>oui</span>
                            <IconComponent
                              name={IconName.CheckRounded}
                              aria-hidden='true'
                              focusable='false'
                              className='ml-6 fill-primary h-3 w-3'
                            />
                          </>
                        )}
                        {rdv.idCreateur !== idConseiller && (
                          <>
                            <span className='sr-only'>non</span>
                            <KoIcon
                              aria-hidden='true'
                              focusable='false'
                              className='h-3'
                            />
                          </>
                        )}
                        <IconComponent
                          name={IconName.ChevronRight}
                          focusable='false'
                          aria-hidden='true'
                          className='w-6 h-6 fill-content_color'
                        />
                      </span>
                    </CellRow>
                  )}
                  {!rdv.idCreateur && <div role='cell' />}
                </a>
              </Link>
            ))}
          </div>
        </TableLayout>
      )}
    </>
  )
}
