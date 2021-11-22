import {RdvJeune} from 'interfaces/rdv'
import {formatDayDate, formatHourMinuteDateUTC} from 'utils/date'

import DeleteIcon from '../../assets/icons/delete.svg'
import LocationIcon from '../../assets/icons/location.svg'
import NoteIcon from '../../assets/icons/note.svg'
import ChevronRight from '../../assets/icons/chevron_right.svg';

type RdvListProps = {
    rdvs: RdvJeune[]
    onDelete?: any
}

const RdvListJeune = ({rdvs, onDelete}: RdvListProps) => {
    const handleDeleteClick = (rdv: RdvJeune) => {
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
                    Pas de rendez-vous planifiés
                </p>
            ) : (
                <table role='presentation' className='w-full'>
                    <caption className='hidden'>Liste de mes rendez-vous</caption>
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
                        <tr key={rdv.id} className='grid grid-cols-table_large gap-x-6 items-center text-sm text-bleu_nuit'>
                            <td className='align-text-top'>
                                {dayHourCells(new Date(rdv.date), rdv.duration)}
                            </td>

                            <td className={'flex'}>
                                <span>
                                <LocationIcon
                                    focusable='false'
                                    aria-hidden='true'
                                    className='mr-[7px] inline'
                                />
                                </span>
                                {rdv.modality}
                            </td>

                            <td className='align-text-top'>
                                <span>
                                    <NoteIcon
                                        focusable='false'
                                        aria-hidden='true'
                                        className='mr-[7px] inline'/>
                                </span>

                                {rdv.comment || '--'}
                            </td>

                            {onDelete && (
                                <td>
                                    <button onClick={() => handleDeleteClick(rdv)}
                                            aria-label={`Supprimer le rendez-vous du ${rdv.date}`}>
                                        <DeleteIcon aria-hidden='true' focusable='false'/>
                                    </button>
                                </td>
                            )}

                            <td className='p-4'>
                                <ChevronRight aria-hidden='true'/>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </>
    )
}

export default RdvListJeune
