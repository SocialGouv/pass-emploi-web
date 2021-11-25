import { RdvJeune } from 'interfaces/rdv'
import React from 'react'
import { formatDayDate, formatHourMinuteDateUTC } from 'utils/date'

import DeleteIcon from '../../assets/icons/delete.svg'
import LocationIcon from '../../assets/icons/location.svg'
import NoteIcon from '../../assets/icons/note.svg'
import ChevronRight from '../../assets/icons/chevron_right.svg'

type ListeRdvJeuneProps = {
  rdvs: RdvJeune[]
  onDelete?: (rdv: RdvJeune) => void
}

const ListeRdvJeune = ({ rdvs, onDelete }: ListeRdvJeuneProps) => {
  const dayHourCells = (rdvDate: Date, duration: string) => {
    return `${formatDayDate(rdvDate)} (${formatHourMinuteDateUTC(
      rdvDate
    )} - ${duration})`
  }

  return (
    <>
      {rdvs.length === 0 ? (
        <p className='text-md text-bleu mb-8'>Pas de rendez-vous planifiés</p>
      ) : (
        <table className='w-full'>
          <caption className='visually-hidden'>
            Liste de mes rendez-vous
          </caption>
          <thead className='visually-hidden'>
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
                <td className='p-4'>
                  {dayHourCells(new Date(rdv.date), rdv.duration)}
                </td>

                <td className={'flex p-4'}>
                  <span>
                    <LocationIcon
                      focusable='false'
                      aria-hidden='true'
                      className='mr-[7px] inline'
                    />
                  </span>
                  {rdv.modality}
                </td>

                <td className='flex p-4'>
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
                  <td className='p-4'>
                    <button
                      onClick={() => onDelete(rdv)}
                      aria-label={`Supprimer le rendez-vous du ${rdv.date}`}
                    >
                      <DeleteIcon aria-hidden='true' focusable='false' />
                    </button>
                  </td>
                )}

                <td className='p-5'>
                  <span>
                    <ChevronRight aria-hidden='true' focusable='false' />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

export default ListeRdvJeune
