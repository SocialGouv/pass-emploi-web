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
  withColumnName?: boolean
  id?: string
  onDelete?: any
}

const RdvList = ({
  id,
  rdvs,
  withColumnName = true,
  onDelete,
}: RdvListProps) => {
  const handleDeleteClick = (rdv: Rdv) => {
    onDelete(rdv)
  }

  const dayHourCells = (rdvDate: Date, duration: string) => {
    const durationString = duration.toString()

    return `${formatDayDate(rdvDate)} (${formatHourMinuteDate(rdvDate)} - ${
      durationString.includes('min')
        ? `${durationString})`
        : `${durationString} min)`
    }`
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
              <HeaderCell scope='col' label='Horaires' />
              {withColumnName && <HeaderCell scope='col' label='Prénom Nom' />}
              <HeaderCell scope='col' label='Type' />
              <HeaderCell scope='col' label='Modalité' />
              <HeaderCell scope='col' label='Note' />
              <HeaderCell scope='col' label='Supprimer le rendez-vous' srOnly />
            </tr>
          </thead>

          <tbody>
            {rdvs.map((rdv: Rdv) => (
              <tr key={rdv.id} className='text-sm text-bleu_nuit'>
                <td className='p-3'>
                  {dayHourCells(new Date(rdv.date), rdv.duration)}
                </td>
                {withColumnName && (
                  <td className='p-3'>
                    {rdv.jeune.prenom} {rdv.jeune.nom}
                  </td>
                )}

                <td className='p-3'>
                  <RdvTypeItem type={rdv.type.label} />
                </td>

                <td className='p-3 '>
                  <LocationIcon
                    focusable='false'
                    aria-hidden='true'
                    className='mr-2 inline'
                  />
                  {rdv.modality}
                </td>

                <td className='p-3 [overflow-wrap:anywhere]'>
                  <NoteIcon
                    focusable='false'
                    aria-hidden='true'
                    className='mr-2 inline'
                  />
                  {(rdv.comment && '1 note(s)') || '--'}
                </td>

                {onDelete && (
                  <td className='p-3'>
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
