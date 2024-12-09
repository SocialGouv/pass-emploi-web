import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { estUserMilo, StructureConseiller } from 'interfaces/conseiller'
import { getIdJeuneMilo } from 'services/beneficiaires.service'
import { trackSSR } from 'utils/analytics/matomo'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ numeroDossier: string }> }
) {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!estUserMilo(user)) redirect('/mes-jeunes')

  const { numeroDossier } = await params
  const idJeune = await getIdJeuneMilo(numeroDossier, accessToken)

  const refererUrl = (await headers()).get('referer') ?? undefined

  trackSSR({
    structure: StructureConseiller.MILO,
    customTitle: `Détail jeune par numéro dossier${
      !Boolean(idJeune) ? ' en erreur' : ''
    }`,
    aDesBeneficiaires: idJeune ? true : null,
    pathname: `/mes-jeunes/milo/${numeroDossier}`,
    refererUrl: refererUrl,
  })

  const destination = idJeune ? `/mes-jeunes/${idJeune}` : '/mes-jeunes'
  redirect(destination)
}
