import { UserAction } from 'interfaces'

import UncheckedIcon from '../../assets/icons/checkbox_unchecked.svg'
import CheckedIcon from '../../assets/icons/checkbox_checked.svg'

type ActionProps = {
	action: UserAction
	toggleStatus?: any
}

const Action = ({ action, toggleStatus }: ActionProps) => {
	const handleCheckChange = () => {
		toggleStatus(action)
	}

	return (
		<>
			{!action.isDone && (
				<button
					className='w-full flex px-[16px] py-[16px] mb-[8px] text-left border border-bleu_blanc rounded-medium'
					onClick={handleCheckChange}
				>
					<UncheckedIcon
						focusable='false'
						aria-hidden='true'
						className='mr-[9px]'
					/>
					<span style={{ flex: '0 0 95%' }}>
						<p className='text-sm text-bleu_nuit break-all'>{action.content}</p>
						<p className='text-sm text-bleu break-all'>{action.comment}</p>
					</span>
				</button>
			)}

			{action.isDone && (
				<button
					className='w-full flex px-[16px] py-[16px] mb-[8px] text-left bg-bleu_nuit border border-bleu_nuit rounded-medium'
					onClick={handleCheckChange}
				>
					<CheckedIcon
						focusable='false'
						aria-hidden='true'
						className='mr-[9px]'
					/>
					<span style={{ flex: '0 0 95%' }}>
						<p className='text-sm text-blanc break-all'>{action.content}</p>
						<p className='text-sm text-bleu break-all'>{action.comment}</p>
					</span>
				</button>
			)}
		</>
	)
}

export default Action
