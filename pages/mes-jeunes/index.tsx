import { Jeune } from 'interfaces'
import withSession, { ServerSideHandler } from 'utils/session'

type MesJeunesProps = {
	jeunes: Jeune[]
}

function MesJeunes({ jeunes }: MesJeunesProps) {
	return (
		<>
			<h1 className='h2 text-bleu_nuit mb-[50px]'> Mes Jeunes</h1>

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

					{jeunes.map((jeune: Jeune) => (
						<tr key={jeune.id} className='text-sm text-bleu_nuit'>
							<td className='p-[16px]'>
								{jeune.firstName} {jeune.lastName}
							</td>

							<td className='p-[16px]'>{jeune.id}</td>
						</tr>
					))}
				</tbody>
			</table>
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

		return {
			props: {
				jeunes: user.jeunes,
			},
		}
	}
)

export default MesJeunes
