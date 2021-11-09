import { ActionStatus, UserAction } from 'interfaces/action'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { formatDayDate } from 'utils/date'
import fetchJson from 'utils/fetchJson'

import BackIcon from '../../../../../assets/icons/arrow_back.svg'

type Props = {
	action: UserAction
}

function Action({ action }: Props) {
	const { query } = useRouter()

	return (
		<>
			<div className='flex items-center mb-[63px]'>
				<Link href={`/actions/jeunes/${query.jeune_id}`} passHref>
					<a
						className='mr-[24px]'
						aria-label="Retour sur la liste d'action du jeune"
					>
						<BackIcon role='img' focusable='false' />
					</a>
				</Link>
				<p className='h4-semi text-bleu_nuit'> Actions de Kenji Girac</p>
			</div>

			<h1 className='h3-semi text-bleu_nuit mb-[24px]'>{action.content}</h1>

			<p className='text-sm text-bleu mb-[24px]'>{action.comment}</p>

			<div className='border-t-2 border-b-2 border-bleu_blanc flex justify-between py-[14px]'>
				<div className='py-[26px]'>
					<p className='text-sm'>
						<span className='text-bleu mr-[25px]'>Date </span>
						<span className='text-bleu_nuit'>
							{formatDayDate(new Date(action.creationDate))}
						</span>
					</p>
				</div>

				<div className='border-r-2 border-bleu_blanc '></div>

				<div className='py-[26px]'>
					<p className='text-sm'>
						<span className='text-bleu mr-[25px]'>Statut </span>
						<span
							className={`text-bleu_nuit border-2 rounded-x_large p-[16px] mr-[8px] ${
								action.status === ActionStatus.NotStarted
									? 'border-bleu_nuit'
									: 'border-bleu_blanc'
							}`}
						>
							À réaliser
						</span>
						<span
							className={`text-bleu_nuit border-2 rounded-x_large p-[16px] mr-[8px] ${
								action.status === ActionStatus.InProgress
									? 'border-bleu_nuit'
									: 'border-bleu_blanc'
							}`}
						>
							En cours
						</span>
						<span
							className={`text-bleu_nuit border-2 rounded-x_large p-[16px] ${
								action.status === ActionStatus.Done
									? 'border-bleu_nuit'
									: 'border-bleu_blanc'
							}`}
						>
							Terminée
						</span>
					</p>
				</div>
			</div>
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
	const res = await fetchJson(
		`${process.env.API_ENDPOINT}/conseiller/jeunes/${query.jeune_id}/actions`
	)

	const mockAction: UserAction = res.actions[0]

	return {
		props: {
			action: mockAction,
		},
	}
}

export default Action
