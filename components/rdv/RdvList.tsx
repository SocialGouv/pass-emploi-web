import { Rdv } from 'interfaces/rdv'
import { formatDayDate, formatHourMinuteDate } from 'utils/date'

import DeleteIcon from '../../assets/icons/delete.svg'
import LocationIcon from '../../assets/icons/location.svg'
import NoteIcon from '../../assets/icons/note.svg'
import React from 'react'
import { RdvTypeItem } from 'components/ui/RdvTypeItem'
import { HeaderCell } from 'components/ui/HeaderCell'

type RdvListProps = {
  rdvs: Rdv[]
  id?: string
  onDelete?: any
}

const RdvList = ({ id, rdvs, onDelete }: RdvListProps) => {
  const handleDeleteClick = (rdv: Rdv) => {
    onDelete(rdv)
  }

  const dayHourCells = (rdvDate: Date, duration: string) => {
    return `${formatDayDate(rdvDate)} (${formatHourMinuteDate(
      rdvDate
    )} - ${duration})`
  }

  return (
    <>
      {rdvs.length === 0 && (
        <p id={id} className='text-md text-bleu mb-8'>
          Vous n&apos;avez pas de rendez-vous pour le moment
        </p>
      )}

      {rdvs.length > 0 && (
        <table id={id} className='w-full'>
          <caption className='sr-only'>Liste de mes rendez-vous</caption>

          <thead>
            <tr>
              {/*<th scope='col'>Date et heure du rendez-vous</th>*/}
              {/*<th scope='col'>Lieu et modalité du rendez-vous</th>*/}
              {/*<th scope='col'>Commentaires</th>*/}
              {/*<th scope='col'>Supprimer le rendez-vous</th>  */}
              {/*<th scope='col'>Horaires</th>*/}
              <HeaderCell scope='col'>Horaires</HeaderCell>
              <HeaderCell scope='col'>Prénom Nom</HeaderCell>
              <HeaderCell scope='col'>Type</HeaderCell>
              <HeaderCell scope='col'>Modalité</HeaderCell>
              <HeaderCell scope='col'>Note</HeaderCell>
              <HeaderCell scope='col' srOnly>
                Supprimer le rendez-vous
              </HeaderCell>
            </tr>
          </thead>

          <tbody>
            {rdvs.map((rdv: Rdv) => (
              <tr key={rdv.id} className='text-sm text-bleu_nuit'>
                <td className='py-4 pr-4'>
                  {dayHourCells(new Date(rdv.date), rdv.duration)}
                </td>

                <td className='py-4 pr-4'>
                  {rdv.jeune.prenom} {rdv.jeune.nom}
                </td>

                {/*<td className='py-4 pr-4'>{rdv.type.label}</td>*/}
                <td className='py-4 pr-4'>
                  <RdvTypeItem type={rdv.type.label} />
                </td>

                <td className='py-4 pr-4 '>
                  <LocationIcon
                    focusable='false'
                    aria-hidden='true'
                    className='mr-2 inline'
                  />
                  {rdv.modality}
                </td>

                <td className='py-4 pr-4 [overflow-wrap:anywhere]'>
                  <NoteIcon
                    focusable='false'
                    aria-hidden='true'
                    className='mr-2 inline'
                  />
                  {rdv.comment || '--'}
                </td>

                {onDelete && (
                  <td className='py-4 pr-4'>
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
