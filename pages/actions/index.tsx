import type { GetServerSideProps } from 'next'
import Link from 'next/link'

import { JeuneActionJson } from 'interfaces/json/action'
import { JeuneActions } from 'interfaces/action'
import { Jeune } from 'interfaces'

import EmptyActionsImage from '../../assets/icons/empty_data.svg'

import linkStyles from 'styles/components/Link.module.css'

type HomeProps = {
	jeuneActionsList: JeuneActions[]
}

const conseiller_id = 1

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
							Les actions de {jeuneActions.jeune.firstName}{' '}
							{jeuneActions.jeune.lastName}
						</h2>

						<p className='text-xs text-bleu_gris flex mb-[25px]'>
							{jeuneActions.nbActionsEnCours !== 0
								? `${jeuneActions.jeune.firstName} a ${
										jeuneActions.nbActionsEnCours
								  } ${
										jeuneActions.nbActionsEnCours === 1 ? 'action' : 'actions'
								  } en cours`
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

						<Link href={`/jeunes/${jeuneActions.jeune.id}/actions`} passHref>
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

export const getServerSideProps: GetServerSideProps = async () => {
	const res = await fetch(
		`${process.env.API_ENDPOINT}/conseillers/${conseiller_id}/actions`
	)
	const data = await res.json()

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
			nbActionsEnCours: jeuneActionJson.todoActionsCount,
			nbActionsTerminees: jeuneActionJson.doneActionsCount,
		}

		jeunesActions.push(newJeuneAction)
	})

	return {
		props: {
			jeuneActionsList: jeunesActions,
		},
	}
}

export default Home
