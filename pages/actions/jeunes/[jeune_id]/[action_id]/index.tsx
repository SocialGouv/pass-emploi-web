import { ActionStatus, UserAction } from 'interfaces/action'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, {useState} from 'react'
import { formatDayDate } from 'utils/date'
import fetchJson from 'utils/fetchJson'

import BackIcon from '../../../../../assets/icons/arrow_back.svg'
import { Jeune } from 'interfaces'

type Props = {
	action: UserAction
	jeune: Jeune
}

function Action({ action, jeune }: Props) {
	const { query } = useRouter()
	const [statutChoisi, setStatutChoisi] = useState<ActionStatus | null>(null)

	return (
		<>
			<div className='flex items-center mb-[63px]'>
				<Link href={`/actions/jeunes/${query.jeune_id}`} passHref>
					<a
						className='mr-[24px]'
						aria-label="Retour sur la liste d'actions du jeune"
					>
						<BackIcon role='img' focusable='false' />
					</a>
				</Link>
				<p className='h4-semi text-bleu_nuit'>
					{' '}
					Actions de {jeune.firstName} {jeune.lastName}
				</p>
			</div>

			<h1 className='h3-semi text-bleu_nuit mb-[24px]'>{action.content}</h1>

			<p className='text-sm text-bleu mb-[24px]'>{action.comment}</p>

			<div className='border-t-2 border-b-2 border-bleu_blanc flex justify-between py-[14px]'>
				<dl className='flex py-[26px]'>
					<dt className='text-bleu text-sm mr-[25px]'>Date </dt>
					<dd className='text-bleu_nuit text-sm'>
						{formatDayDate(new Date(action.creationDate))}
					</dd>
				</dl>

				<div className='border-r-2 border-bleu_blanc '></div>

				<div className='py-[26px]'>
					<fieldset className='text-sm'>
						<legend className='text-bleu mr-[25px]'>Statut </legend>
						<label
							className={`text-bleu_nuit border-2 rounded-x_large p-[16px] mr-[8px] ${
								action.status === ActionStatus.NotStarted
									? 'border-bleu_nuit'
									: 'border-bleu_blanc'
							}`}>

							<input
								type="radio"
								id="option-statut--not_started"
								name="option-statut--not_started"
								checked={statutChoisi === "not_started"}
								onChange={() => setStatutChoisi("not_started")}
								required
							/>
							<span>À réaliser</span>
						</label>

						<label 	className={`text-bleu_nuit border-2 rounded-x_large p-[16px] mr-[8px] ${
							action.status === ActionStatus.InProgress
								? 'border-bleu_nuit'
								: 'border-bleu_blanc'
						}`}>
							<input
								type="radio"
								id="option-statut--in_progress"
								name="option-statut--in_progress"
								checked={statutChoisi === "in_progress"}
								onChange={() => setStatutChoisi("in_progress")}
								required
							/>
							<span>En cours</span>
						</label>

						<label 	className={`text-bleu_nuit border-2 rounded-x_large p-[16px] ${
							action.status === ActionStatus.Done
								? 'border-bleu_nuit'
								: 'border-bleu_blanc'
						}`} >
							<input
								type="radio"
								id="option-statut--done"
								name="option-statut--done"
								checked={statutChoisi === "done"}
								onChange={() => setStatutChoisi("done")}
								required
							/>
							<span>Terminée</span>
						</label>

					</fieldset>
				</div>
			</div>
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
	const res = await fetchJson(
		`${process.env.API_ENDPOINT}/actions/${query.action_id}`
	)

	return {
		props: {
			action: res,
			jeune: res.jeune,
		},
	}
}

export default Action
