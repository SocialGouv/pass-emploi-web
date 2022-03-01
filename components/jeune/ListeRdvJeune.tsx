import { RdvJeune } from 'interfaces/rdv'
import React from 'react'
import { formatDayDate, formatHourMinuteDate } from 'utils/date'

import DeleteIcon from '../../assets/icons/delete.svg'
import LocationIcon from '../../assets/icons/location.svg'
import NoteIcon from '../../assets/icons/note.svg'

type ListeRdvJeuneProps = {
  rdvs: RdvJeune[]
  onDelete?: (rdv: RdvJeune) => void
}

const ListeRdvJeune = ({ rdvs, onDelete }: ListeRdvJeuneProps) => {
  const dayHourCells = (rdvDate: Date, duration: string) => {
    return `${formatDayDate(rdvDate)} (${formatHourMinuteDate(
      rdvDate
    )} - ${duration})`
  }

  return (
    <>
      {rdvs.length === 0 ? (
        <p className='text-md text-bleu mb-8'>Pas de rendez-vous planifiés</p>
      ) : (
        <table className='w-full'>
          <caption className='sr-only'>Liste de mes rendez-vous</caption>
          <thead className='sr-only'>
            <tr>
              <th scope='col'>Date et heure du rendez-vous</th>
              <th scope='col'>Lieu et modalité du rendez-vous</th>
              <th scope='col'>Commentaires</th>
              <th scope='col'>Supprimer le rendez-vous</th>
            </tr>
          </thead>

          <tbody>
            {rdvs.map((rdv: RdvJeune) => (
              <tr
                key={rdv.id}
                className='grid grid-cols-table_large items-baseline text-sm text-bleu_nuit'
              >
                <td className='py-4 px-2'>
                  {dayHourCells(new Date(rdv.date), `${rdv.duration} min`)}
                </td>

                <td className={'flex py-4 px-2'}>
                  <span>
                    <LocationIcon
                      focusable='false'
                      aria-hidden='true'
                      className='mr-[7px] inline'
                    />
                  </span>
                  {rdv.modality}
                </td>

                <td className='flex py-4 px-2'>
                  <span>
                    <NoteIcon
                      focusable='false'
                      aria-hidden='true'
                      className='mr-[7px] inline'
                    />
                  </span>
                  {rdv.comment || '--'}
                </td>

                {onDelete && (
                  <td className='py-4 px-2'>
                    <button
                      onClick={() => onDelete(rdv)}
                      aria-label={`Supprimer le rendez-vous du ${rdv.date}`}
                      className='border-none'
                    >
                      <DeleteIcon aria-hidden='true' focusable='false' />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

export default ListeRdvJeune
