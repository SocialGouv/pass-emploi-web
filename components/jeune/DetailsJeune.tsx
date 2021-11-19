import React from 'react'
import { Jeune } from 'interfaces'

export const DetailsJeune = ({ firstName, lastName, id }: Jeune) => {
	return (
		<>
			<h1 className='h2-semi text-bleu_nuit pb-6'>
				{firstName} {lastName}
			</h1>
			<dl className='flex text-sm-semi text-bleu_nuit'>
				<dt className='mr-[1rem]'>Identifiant:</dt>
				<dd>{id}</dd>
			</dl>
		</>
	)
}
