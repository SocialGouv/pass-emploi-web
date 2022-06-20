import Link from 'next/link'

import KoIcon from '../../assets/icons/ko.svg'
import LocationIcon from '../../assets/icons/location.svg'

import { HeaderCell } from 'components/rdv/HeaderCell'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { RdvTypeTag } from 'components/ui/RdvTypeTag'
import { Jeune } from 'interfaces/jeune'
import { RdvListItem } from 'interfaces/rdv'
import { formatDayDate, formatHourMinuteDate } from 'utils/date'

type RdvListProps = {
  rdvs: RdvListItem[]
  idConseiller: string
  withNameJeune?: boolean
}

const RdvList = ({
  rdvs,
  idConseiller,
  withNameJeune = true,
}: RdvListProps) => {
  const dayHourCells = (rdvDate: Date, duration: number) => {
    return `${formatDayDate(rdvDate)} (${formatHourMinuteDate(
      rdvDate
    )} - ${duration} min)`
  }

  return (
    <>
      {rdvs.length === 0 && (
        <p className='text-md mb-2'>
          Vous n’avez pas de rendez-vous pour le moment
        </p>
      )}

      {rdvs.length > 0 && (
        <div
          role='table'
          className='table w-full'
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
                  className='table-row text-sm  hover:bg-primary_lighten'
                >
                  <div role='cell' className='table-cell p-3'>
                    {dayHourCells(new Date(rdv.date), rdv.duration)}
                  </div>
                  {withNameJeune && (
                    <div role='cell' className='table-cell p-3'>
                      {rdv.beneficiaires}
                    </div>
                  )}

                  <div role='cell' className='table-cell p-3'>
                    <RdvTypeTag type={rdv.type} />
                  </div>

                  <div role='cell' className='table-cell p-3 '>
                    <LocationIcon
                      focusable='false'
                      aria-hidden='true'
                      className='mr-2 inline'
                    />
                    {rdv.modality}
                  </div>

                  {rdv.idCreateur && (
                    <div role='cell' className='table-cell p-3'>
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
                    </div>
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

export default RdvList
