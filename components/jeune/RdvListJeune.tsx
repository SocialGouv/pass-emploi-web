import { RdvJeune } from 'interfaces/rdv'
import {formatDayDate, formatHourMinuteDateUTC} from 'utils/date'

import DeleteIcon from '../../assets/icons/delete.svg'
import LocationIcon from '../../assets/icons/location.svg'
import NoteIcon from '../../assets/icons/note.svg'

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

                    <tbody>
                    {rdvs.map((rdv: RdvJeune) => (
                        <tr key={rdv.id} className='text-sm text-bleu_nuit'>
                            <td className='p-[16px]'>
                                {dayHourCells(new Date(rdv.date), rdv.duration)}
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
                                    <button onClick={() => handleDeleteClick(rdv)} className=''>
                                        <DeleteIcon aria-hidden='true' focusable='false'/>
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

export default RdvListJeune
