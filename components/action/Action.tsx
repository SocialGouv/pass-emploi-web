import { UserAction, ActionStatus } from 'interfaces/action'

import NoteIcon from '../../assets/icons/note_outline.svg'
import ChevronIcon from '../../assets/icons/chevron_right.svg'
import React from 'react'
import Link from 'next/link'

type ActionProps = {
	action: UserAction
	jeuneId: string | string[]
}

function NotStarted() {
	return (
		<p className='text-xs-semi text-blanc px-[16px] py-[2px] bg-rose rounded-x_large'>
			À faire
		</p>
	)
}

function InProgress() {
	return (
		<p className='text-xs-semi text-blanc px-[16px] py-[2px] bg-violet rounded-x_large'>
			Commencée
		</p>
	)
}

function Done() {
	return (
		<p className='text-xs-semi text-bleu_nuit px-[16px] py-[2px] bg-bleu_gris rounded-x_large'>
			Terminée
		</p>
	)
}

function Status(props: any) {
	switch (props.status) {
		case ActionStatus.InProgress:
			return <InProgress />

		case ActionStatus.Done:
			return <Done />

		case ActionStatus.NotStarted:
		default:
			return <NotStarted />
	}
}

const Action = ({ action, jeuneId }: ActionProps) => {
	return (
		<Link href={`/actions/jeunes/${jeuneId}/${action.id}`}>
			<a className='w-full  px-[16px] py-[16px] text-left border-x border-bleu_blanc '>
				{action.creator && (
					<p className='text-sm text-bleu_nuit mb-[8px]'>
						Créé par {action.creator}
					</p>
				)}

				<div className='w-full flex justify-between  '>
					<span style={{ flex: '0 0 70%' }}>
						<p className='text-md text-bleu_nuit break-all mb-[8px]'>
							{action.content}
						</p>
						<p className='text-sm text-bleu_nuit break-all'>
							<NoteIcon
								focusable='false'
								aria-hidden='true'
								className='mr-[7px] inline'
							/>
							{action.comment || '--'}
						</p>
					</span>
					<span>
						<Status status={action.status} />
					</span>
					<span className='text-sm text-bleu_nuit '>
						Détail de l&apos;action
						<ChevronIcon
							focusable='false'
							aria-hidden='true'
							className='ml-[7px] inline'
						/>
					</span>
				</div>
			</a>
		</Link>
	)
}

export default Action
