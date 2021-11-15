
interface RadioButtonStatusProps {
    status: string;
    isSelected: boolean;
    onChange: () => void | Promise<void>;
}

export const RadioButtonStatus = ({status, isSelected, onChange}: RadioButtonStatusProps) => {
    return (
        <span
            className={`text-bleu_nuit border-2 rounded-x_large p-[16px] mr-[8px] ${isSelected ? 'border-bleu_nuit'
                : 'border-bleu_blanc'}`} aria-selected={isSelected}>
							<label htmlFor="option-statut--not_started">{status}</label>
								<input
                                    type="radio"
                                    id="option-statut--not_started"
                                    name="option-statut"
                                    checked={isSelected}
                                    onChange={onChange}
                                    required
                                />

							</span>
    )
}