import { ActionStatus, UserAction } from 'interfaces/action'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { formatDayDate } from 'utils/date'
import fetchJson from 'utils/fetchJson'

import BackIcon from '../../../../../assets/icons/arrow_back.svg'
import {Jeune} from "interfaces";

type Props = {
	action: UserAction
	jeune: Jeune
}

function Action({ action, jeune }: Props) {
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
				<p className='h4-semi text-bleu_nuit'> Actions de {jeune.firstName} {jeune.lastName}</p>
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
		`${process.env.API_ENDPOINT}/actions/${query.action_id}`
	)

	return {
		props: {
			action: res,
			jeune: res.jeune
		},
	}
}

export default Action
