import Link from 'next/link'

import KoIcon from '../../assets/icons/ko.svg'
import LocationIcon from '../../assets/icons/location.svg'

import { HeaderCell } from 'components/rdv/HeaderCell'
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
        <div
          role='table'
          className='table w-full border-spacing-y-3 border-separate'
          aria-label='Liste de mes rendez-vous'
        >
          <div role='rowgroup' className='table-row-group'>
            <div role='row' className='table-row'>
              <HeaderCell label='Horaires' />
              {withNameJeune && <HeaderCell label='Prénom Nom' />}
              <HeaderCell label='Type' />
              <HeaderCell label='Modalité' />
              <HeaderCell label='Créé par vous' />
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
                  <CellRow style='rounded-l-small'>
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
                    <CellRow style='rounded-r-small'>
                      {rdv.idCreateur === idConseiller && (
                        <>
                          <span className='sr-only'>oui</span>
                          <IconComponent
                            name={IconName.CheckRounded}
                            aria-hidden='true'
                            focusable='false'
                            className='fill-primary h-3 w-3'
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
                    </CellRow>
                  )}
                  {!rdv.idCreateur && <div role='cell' />}
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
