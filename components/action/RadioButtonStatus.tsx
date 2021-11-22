import { MouseEvent } from 'react'

interface RadioButtonStatusProps {
  status: string
  isSelected: boolean
  onChange: () => void
}

export const RadioButtonStatus =
  ({ status, isSelected, onChange }: RadioButtonStatusProps) => {
    const onClickSpan = (e: MouseEvent) => {
      e.preventDefault()
      onChange()
    }

    return (
      <span
        className={`text-bleu_nuit border-2 rounded-x_large p-[16px] mr-[8px] hover:cursor-pointer ${
          isSelected
            ? 'text-sm-semi border-bleu_nuit bg-bleu_blanc'
            : 'border-bleu_blanc text-sm'
        }`}
        onClick={onClickSpan}
      >
			<label htmlFor={`option-statut--${status}`}>{status}</label>
			<input
        className='visually-hidden'
        type='radio'
        id={`option-statut--${status}`}
        name='option-statut'
        checked={isSelected}
        onChange={() => {}}
        required
      />
		</span>
    )
  }
