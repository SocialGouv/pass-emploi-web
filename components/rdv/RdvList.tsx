import { Rdv } from 'interfaces/rdv'
import { formatDayDate, formatHourMinuteDateUTC } from 'utils/date'

import DeleteIcon from '../../assets/icons/delete.svg'
import LocationIcon from '../../assets/icons/location.svg'
import NoteIcon from '../../assets/icons/note.svg'

type RdvListProps = {
  rdvs: Rdv[]
  onDelete?: any
}

const RdvList = ({ rdvs, onDelete }: RdvListProps) => {
  const handleDeleteClick = (rdv: Rdv) => {
    onDelete(rdv)
  }

  const dayHourCells = (rdvDate: Date, duration: string) => {
    return `${formatDayDate(rdvDate)} (${formatHourMinuteDateUTC(
      rdvDate
    )} - ${duration})`
  }

  return (
    <>
      {rdvs.length === 0 ? (
        <p className='text-md text-bleu mb-8'>
          Vous n&apos;avez pas de rendez-vous pour le moment
        </p>
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
            {rdvs.map((rdv: Rdv) => (
              <tr key={rdv.id} className='text-sm text-bleu_nuit'>
                <td className='p-[16px]'>
                  {dayHourCells(new Date(rdv.date), rdv.duration)}
                </td>

                <td className='p-[16px]'>
                  {rdv.jeune.prenom} {rdv.jeune.nom}
                </td>

                <td className='p-[16px] '>
                  <LocationIcon
                    focusable='false'
                    aria-hidden='true'
                    className='mr-[7px] inline'
                  />
                  {rdv.modality}
                </td>

                <td className='p-[16px] '>
                  <NoteIcon
                    focusable='false'
                    aria-hidden='true'
                    className='mr-[7px] inline'
                  />
                  {rdv.comment || '--'}
                </td>

                {onDelete && (
                  <td className='p-[16px]'>
                    <button
                      onClick={() => handleDeleteClick(rdv)}
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

export default RdvList
