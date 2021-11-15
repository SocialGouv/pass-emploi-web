interface RadioButtonStatusProps {
	status: string
	isSelected: boolean
	onChange: () => void
}

export const RadioButtonStatus = ({
	status,
	isSelected,
	onChange,
}: RadioButtonStatusProps) => {
	return (
		<span
			className={`text-bleu_nuit border-2 rounded-x_large p-[16px] mr-[8px] hover:cursor-pointer ${
				isSelected ? 'border-bleu_nuit' : 'border-bleu_blanc'
			}`}
			aria-selected={isSelected}
			onClick={onChange}
		>
			<label htmlFor={`option-statut--${status}`}>{status}</label>
			<input
				className='hidden'
				type='radio'
				id={`option-statut--${status}`}
				name='option-statut'
				checked={isSelected}
				onChange={onChange}
				required
			/>
		</span>
	)
}
