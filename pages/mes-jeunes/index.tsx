import React, { useState } from 'react'

import AddJeuneModal from 'components/jeune/AddJeuneModal'
import Button from 'components/Button'

import { Jeune } from 'interfaces'

import withSession, { ServerSideHandler } from 'utils/session'

import AddIcon from '../../assets/icons/add_person.svg'
import fetchJson from 'utils/fetchJson'

type MesJeunesProps = {
	conseillerId: string
	conseillerJeunes: Jeune[]
}

function MesJeunes({ conseillerId, conseillerJeunes }: MesJeunesProps) {
	const [showModal, setShowModal] = useState(false)
	const [jeunes, setJeunes] = useState<Jeune[]>(conseillerJeunes)

	const handleAddJeune = async (newJeune: Jeune) => {
		setJeunes([newJeune, ...jeunes])
	}

	return (
		<>
			<span className='flex flex-wrap justify-between mb-[50px]'>
				<h1 className='h2-semi text-bleu_nuit'>Mes Jeunes</h1>
				<Button onClick={() => setShowModal(true)}>
					<AddIcon focusable='false' aria-hidden='true' className='mr-[8px]' />
					Ajouter un jeune
				</Button>
			</span>

			<table role='presentation'>
				<caption className='hidden'>Liste de mes bénéficiaires</caption>

				<tbody>
					<tr>
						<th scope='col' className='text-sm text-bleu text-left p-[16px]'>
							Nom du jeune
						</th>

						<th scope='col' className='text-sm text-bleu text-left p-[16px]'>
							Identifiant
						</th>
					</tr>

					{jeunes?.map((jeune: Jeune) => (
						<tr key={jeune.id} className='text-sm text-bleu_nuit'>
							<td className='p-[16px]'>
								{jeune.firstName} {jeune.lastName}
							</td>

							<td className='p-[16px]'>{jeune.id}</td>
						</tr>
					))}
				</tbody>
			</table>

			<AddJeuneModal
				onClose={() => setShowModal(false)}
				onAdd={(newJeune: Jeune) => handleAddJeune(newJeune)}
				show={showModal}
			/>
		</>
	)
}

export const getServerSideProps = withSession<ServerSideHandler>(
	async ({ req, res }) => {
		const user = req.session.get('user')
		const userId = user.id

		if (user === undefined) {
			res.setHeader('location', '/login')
			res.statusCode = 302
			res.end()
			return {
				props: {},
			}
		}

		const data = await fetchJson(
			`${process.env.API_ENDPOINT}/conseillers/${userId}/login`
		)

		return {
			props: {
				conseillerId: userId,
				conseillerJeunes: data?.jeunes || [],
			},
		}
	}
)

export default MesJeunes
