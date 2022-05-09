import Link from 'next/link'
import { MouseEvent } from 'react'

import DeleteIcon from '../../assets/icons/delete.svg'
import DoneIcon from '../../assets/icons/done.svg'
import KoIcon from '../../assets/icons/ko.svg'
import LocationIcon from '../../assets/icons/location.svg'
import NoteIcon from '../../assets/icons/note.svg'

import { HeaderCell } from 'components/rdv/HeaderCell'
import { RdvTypeTag } from 'components/ui/RdvTypeTag'
import { RdvListItem } from 'interfaces/rdv'
import { formatDayDate, formatHourMinuteDate } from 'utils/date'

type RdvListProps = {
  rdvs: RdvListItem[]
  idConseiller: string
  withNameJeune?: boolean
  id?: string
  onDelete?: (rdv: RdvListItem) => void
}

const RdvList = ({
  rdvs,
  idConseiller,
  withNameJeune = true,
  id,
  onDelete,
}: RdvListProps) => {
  const handleDelete = (e: MouseEvent<HTMLElement>, rdv: RdvListItem) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete) onDelete(rdv)
  }

  const dayHourCells = (rdvDate: Date, duration: number) => {
    return `${formatDayDate(rdvDate)} (${formatHourMinuteDate(
      rdvDate
    )} - ${duration} min)`
  }

  return (
    <>
      {rdvs.length === 0 && (
        <p id={id} className='text-md  mb-8'>
          Vous n&apos;avez pas de rendez-vous pour le moment
        </p>
      )}

      {rdvs.length > 0 && (
        <div
          role='table'
          id={id}
          className='table w-full'
          aria-describedby='table-caption'
        >
          <span id='table-caption' className='sr-only'>
            Liste de mes rendez-vous
          </span>

          <div role='rowgroup' className='table-row-group'>
            <div role='row' className='table-row'>
              <HeaderCell label='Horaires' />
              {withNameJeune && <HeaderCell label='Prénom Nom' />}
              <HeaderCell label='Type' />
              <HeaderCell label='Modalité' />
              <HeaderCell label='Note' />
              <HeaderCell label='Créé par vous' />
              <HeaderCell label='Supprimer le rendez-vous' srOnly />
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
                  aria-label={`Modifier rendez-vous du ${rdv.date} avec ${rdv.jeune.prenom} ${rdv.jeune.nom}`}
                  className='table-row text-sm  hover:bg-primary_lighten'
                >
                  <div role='cell' className='table-cell p-3'>
                    {dayHourCells(new Date(rdv.date), rdv.duration)}
                  </div>
                  {withNameJeune && (
                    <div role='cell' className='table-cell p-3'>
                      {rdv.jeune.prenom} {rdv.jeune.nom}
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

                  <div role='cell' className='table-cell p-3'>
                    <NoteIcon
                      focusable='false'
                      aria-hidden='true'
                      className='mr-2 inline'
                    />
                    {(rdv.hasComment && '1 note(s)') || '--'}
                  </div>

                  {rdv.idCreateur && (
                    <div role='cell' className='table-cell p-3'>
                      {rdv.idCreateur === idConseiller && (
                        <>
                          <span className='sr-only'>oui</span>
                          <DoneIcon
                            aria-hidden='true'
                            focusable='false'
                            className='fill-primary h-3'
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

                  {onDelete && (
                    <div
                      role='cell'
                      className='table-cell p-3'
                      onClick={(e) => handleDelete(e, rdv)}
                    >
                      <button
                        onClick={(e) => handleDelete(e, rdv)}
                        aria-label={`Supprimer le rendez-vous du ${rdv.date}`}
                        className='border-none'
                      >
                        <DeleteIcon aria-hidden='true' focusable='false' />
                      </button>
                    </div>
                  )}
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
