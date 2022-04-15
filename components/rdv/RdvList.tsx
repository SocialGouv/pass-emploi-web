import { HeaderCell } from 'components/rdv/HeaderCell'
import { RdvTypeTag } from 'components/ui/RdvTypeTag'
import { Rdv } from 'interfaces/rdv'
import Link from 'next/link'
import { MouseEvent } from 'react'
import { formatDayDate, formatHourMinuteDate } from 'utils/date'
import DeleteIcon from '../../assets/icons/delete.svg'
import LocationIcon from '../../assets/icons/location.svg'
import NoteIcon from '../../assets/icons/note.svg'
import DoneIcon from '../../assets/icons/done.svg'
import KoIcon from '../../assets/icons/ko.svg'

type RdvListProps = {
  rdvs: Rdv[]
  idConseiller: string
  withNameJeune?: boolean
  id?: string
  onDelete?: any
}

const RdvList = ({
  rdvs,
  idConseiller,
  withNameJeune = true,
  id,
  onDelete,
}: RdvListProps) => {
  const handleDeleteClick = (e: MouseEvent<HTMLElement>, rdv: Rdv) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete(rdv)
  }

  const dayHourCells = (rdvDate: Date, duration: number) => {
    return `${formatDayDate(rdvDate)} (${formatHourMinuteDate(
      rdvDate
    )} - ${duration} min)`
  }

  return (
    <>
      {rdvs.length === 0 && (
        <p id={id} className='text-md text-bleu mb-8'>
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
              <HeaderCell label='Crée par vous' />
              <HeaderCell label='Supprimer le rendez-vous' srOnly />
            </div>
          </div>

          <div role='rowgroup' className='table-row-group'>
            {rdvs.map((rdv: Rdv) => (
              <Link
                href={'/mes-jeunes/edition-rdv?idRdv=' + rdv.id}
                key={rdv.id}
              >
                <a
                  role='row'
                  key={rdv.id}
                  aria-label={`Modifier rendez-vous du ${rdv.date} avec ${rdv.jeune.prenom} ${rdv.jeune.nom}`}
                  className='table-row text-sm text-bleu_nuit hover:bg-gris_blanc'
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
                    <RdvTypeTag type={rdv.type.label} />
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
                    {(rdv.comment && '1 note(s)') || '--'}
                  </div>

                  {rdv.idCreateur && (
                    <div
                      role='cell'
                      className='table-cell p-3'
                      aria-label={
                        rdv.idCreateur === idConseiller ? 'oui' : 'non'
                      }
                    >
                      {rdv.idCreateur === idConseiller && (
                        <DoneIcon
                          aria-hidden='true'
                          focusable='false'
                          className='fill-primary'
                        />
                      )}
                      {rdv.idCreateur !== idConseiller && (
                        <KoIcon aria-hidden='true' focusable='false' />
                      )}
                    </div>
                  )}
                  {!rdv.idCreateur && <div role='cell' />}

                  {onDelete && (
                    <div
                      role='cell'
                      className='table-cell p-3'
                      onClick={(e) => handleDeleteClick(e, rdv)}
                    >
                      <button
                        onClick={(e) => handleDeleteClick(e, rdv)}
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
