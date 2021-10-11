import Router from 'next/router'
import { useState } from 'react'

import withSession, { ServerSideHandler } from 'utils/session'

import AddRdvModal from 'components/rdv/AddRdvModal'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import Button from 'components/Button'

import AddIcon from '../assets/icons/add.svg'

import { Rdv } from 'interfaces/rdv'
import { RdvJson } from 'interfaces/json/rdv'
import { durees } from 'referentiel/rdv'
import fetchJson from 'utils/fetchJson'
import RdvList from 'components/rdv/RdvList'

type HomeProps = {
	rdvs: Rdv[]
	oldRdvs: Rdv[]
}

const defaultRdv = {
	id: 'string',
	title: 'string',
	subtitle: 'string',
	comment: 'string',
	date: 'string',
	duration: 'string',
	modality: 'string',
}

const Home = ({ rdvs, oldRdvs }: HomeProps) => {
	const [showAddModal, setShowAddModal] = useState(false)
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [selectedRdv, setSelectedRdv] = useState(defaultRdv)
	const [rdvsAvenir, setRdvsAvenir] = useState(rdvs)

	return (
		<>
			<span className='flex flex-wrap justify-between mb-[20px]'>
				<h1 className='h2-semi text-bleu_nuit'>Mes rendez-vous à venir</h1>
				<Button onClick={() => setShowAddModal(true)}>
					<AddIcon focusable='false' aria-hidden='true' />
					Fixer un rendez-vous
				</Button>
			</span>

			{rdvsAvenir?.length === 0 && (
				<p className='text-md text-bleu mb-8'>
					Vous n&rsquo;avez pas de rendez-vous à venir pour le moment
				</p>
			)}

			<RdvList
				rdvs={rdvsAvenir}
				onDelete={(rdv: Rdv) => {
					setShowDeleteModal(true)
					setSelectedRdv(rdv)
				}}
			/>

			<h2 className='h3-semi text-bleu_nuit mb-[20px]'>
				Historique de mes rendez-vous
			</h2>

			{oldRdvs?.length === 0 && (
				<p className='text-md text-bleu mb-8'>
					Vous n&rsquo;avez pas de rendez-vous archivés pour le moment
				</p>
			)}

			<RdvList rdvs={oldRdvs} />

			<AddRdvModal
				onClose={() => setShowAddModal(false)}
				onAdd={() => {
					Router.reload()
				}}
				show={showAddModal}
			/>

			<DeleteRdvModal
				onClose={() => setShowDeleteModal(false)}
				onDelete={() => {
					const index = rdvsAvenir.indexOf(selectedRdv)
					const newArray = [
						...rdvsAvenir.slice(0, index),
						...rdvsAvenir.slice(index + 1, rdvsAvenir.length),
					]
					setRdvsAvenir(newArray)
				}}
				show={showDeleteModal}
				rdv={selectedRdv}
			/>
		</>
	)
}

export const getServerSideProps = withSession<ServerSideHandler>(
	async ({ req, res }) => {
		const user = req.session.get('user')

		if (user === undefined) {
			res.setHeader('location', '/login')
			res.statusCode = 302
			res.end()
			return {
				props: {},
			}
		}

		const data = await fetchJson(
			`${process.env.API_ENDPOINT}/conseillers/${user.id}/rendezvous`
		)

		let serializedRdvs: Rdv[] = []

		data.map((rdvData: RdvJson) => {
			const newrdv: Rdv = {
				...rdvData,
				duration:
					durees.find((duree: any) => duree.value === rdvData.duration)?.text ||
					rdvData.duration,
			}

			serializedRdvs.push(newrdv)
		})

		if (!data) {
			return {
				notFound: true,
			}
		}

		const today = new Date()

		return {
			props: {
				rdvs: serializedRdvs.filter((rdv) => new Date(rdv.date) >= today),
				oldRdvs: serializedRdvs.filter((rdv) => new Date(rdv.date) < today),
			},
		}
	}
)

export default Home
