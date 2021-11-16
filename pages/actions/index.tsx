import Link from 'next/link'

import { JeuneActionJson } from 'interfaces/json/action'
import { JeuneActions } from 'interfaces/action'
import { Jeune } from 'interfaces'

import EmptyActionsImage from '../../assets/icons/empty_data.svg'

import linkStyles from 'styles/components/Link.module.css'
import withSession, { ServerSideHandler } from 'utils/session'
import fetchJson from 'utils/fetchJson'

type HomeProps = {
	jeuneActionsList: JeuneActions[]
}

function Home({ jeuneActionsList }: HomeProps) {
	return (
		<>
			<h1 className='h2 text-bleu_nuit mb-[45px]'>
				Les actions de mes bénéficaires
			</h1>

			{!jeuneActionsList?.length && (
				<>
					<EmptyActionsImage
						focusable='false'
						aria-hidden='true'
						className='m-auto mb-[30px]'
					/>
					<p className='text-md-semi text-bleu_nuit text-center'>
						Vous devriez avoir des jeunes inscrits pour visualiser leurs actions
					</p>
				</>
			)}

			<ul className='grid grid-cols-2 gap-5 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1'>
				{jeuneActionsList.map((jeuneActions: JeuneActions) => (
					<li
						key={`actions-${jeuneActions.jeune.id}`}
						className='p-[15px]  border-2 border-bleu_blanc rounded-medium'
					>
						<h2 className='text-md text-bleu_nuit mb-[19px]'>
							{jeuneActions.jeune.firstName} {jeuneActions.jeune.lastName}
						</h2>

						<p className='text-xs text-bleu_gris flex mb-[25px]'>
							{jeuneActions.nbActionsAFaire !== 0
								? `${jeuneActions.jeune.firstName} a ${
										jeuneActions.nbActionsAFaire
								  } ${
										jeuneActions.nbActionsAFaire === 1 ? 'action' : 'actions'
								  } à faire`
								: `${jeuneActions.jeune.firstName} n'a pas d'actions à faire pour le moment`}
						</p>

						<p className='text-xs text-bleu_gris flex mb-[25px]'>
							{jeuneActions.nbActionsEnCours !== 0
								? `${jeuneActions.jeune.firstName} a ${jeuneActions.nbActionsEnCours} en cours`
								: `${jeuneActions.jeune.firstName} n'a pas d'actions en cours pour le moment`}
						</p>

						<p className='text-xs text-bleu_gris flex mb-[45px]'>
							{jeuneActions.nbActionsTerminees !== 0
								? `${jeuneActions.jeune.firstName} a ${
										jeuneActions.nbActionsTerminees
								  } ${
										jeuneActions.nbActionsTerminees === 1
											? 'action terminée'
											: 'actions terminées'
								  }`
								: `${jeuneActions.jeune.firstName} n'a pas d'actions terminées pour le moment`}
						</p>

						<Link href={`/actions/jeunes/${jeuneActions.jeune.id}`} passHref>
							<a className={`text-xs float-right ${linkStyles.buttonBlue}`}>
								VOIR LES ACTIONS
							</a>
						</Link>
					</li>
				))}
			</ul>
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
			`${process.env.API_ENDPOINT}/conseillers/${user.id}/actions`
		)

		if (!data) {
			return {
				notFound: true,
			}
		}

		let jeunesActions: JeuneActions[] = []

		data.map((jeuneActionJson: JeuneActionJson) => {
			const newJeune: Jeune = {
				id: jeuneActionJson.jeuneId,
				firstName: jeuneActionJson.jeuneFirstName,
				lastName: jeuneActionJson.jeuneLastName,
			}

			const newJeuneAction: JeuneActions = {
				jeune: newJeune,
				nbActionsEnCours: jeuneActionJson.inProgressActionsCount,
				nbActionsTerminees: jeuneActionJson.doneActionsCount,
				nbActionsAFaire: jeuneActionJson.todoActionsCount,
			}

			jeunesActions.push(newJeuneAction)
		})

		return {
			props: {
				jeuneActionsList: jeunesActions,
			},
		}
	}
)

export default Home
