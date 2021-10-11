import { Rdv } from 'interfaces/rdv'
import { formatDayDate } from 'utils/date'

import CalendarIcon from '../../assets/icons/calendar.svg'
import TimeIcon from '../../assets/icons/time.svg'
import DeleteIcon from '../../assets/icons/delete.svg'

type RdvListProps = {
	rdvs: Rdv[]
	onDelete?: any
}

const RdvList = ({ rdvs, onDelete }: RdvListProps) => {
	const handleDeleteClick = (rdv: Rdv) => {
		onDelete(rdv)
	}

	return (
		<ul className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 mb-[50px]'>
			{rdvs.map((rdv: Rdv) => (
				<li
					key={rdv.id}
					className='text-bleu_nuit relative p-[15px] border-2 border-bleu_blanc rounded-medium'
				>
					<p className='flex flex-wrap justify-between mb-[15px]'>
						<span className='flex flex-wrap'>
							<CalendarIcon
								focusable='false'
								aria-hidden='true'
								className='mr-[7px]'
							/>
							{formatDayDate(new Date(rdv.date))}
						</span>
						<span className='flex flex-wrap'>
							<TimeIcon
								focusable='false'
								aria-hidden='true'
								className='mr-[7px]'
							/>
							{`${new Date(rdv.date).getUTCHours()}:00`}
							{` - ${rdv.duration}`}
						</span>
					</p>

					<p className='text-md-semi mb-[15px]'>{rdv.title} </p>

					<p className='text-xs text-bleu_gris mb-[15px]'>{rdv.modality}</p>
					{rdv.comment && (
						<p className='text-xs text-bleu_gris'>Notes: {rdv.comment}</p>
					)}

					{onDelete && (
						<button
							onClick={() => handleDeleteClick(rdv)}
							className='mt-[15px] absolute bottom-3 right-3'
						>
							<DeleteIcon aria-hidden='true' focusable='false' />
						</button>
					)}
				</li>
			))}
		</ul>
	)
}

export default RdvList
