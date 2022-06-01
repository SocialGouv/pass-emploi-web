import { GetServerSideProps } from 'next'

import { UserStructure } from 'interfaces/conseiller'
import { JeunesService } from 'services/jeunes.service'
import { trackSSR } from 'utils/analytics/matomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

function MiloFicheJeune() {
  return null
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const { user, accessToken } = sessionOrRedirect.session
  if (user.structure !== UserStructure.MILO) {
    return { redirect: { destination: '/mes-jeunes', permanent: true } }
  }

  const numeroDossier = context.query.numero_dossier as string
  const jeunesServices = withDependance<JeunesService>('jeunesService')
  const idJeune = await jeunesServices.getIdJeuneMilo(
    numeroDossier,
    accessToken
  )

  const destination = idJeune ? `/mes-jeunes/${idJeune}` : '/mes-jeunes'
  trackSSR({
    structure: UserStructure.MILO,
    customTitle: `Détail jeune par numéro dossier${
      !Boolean(idJeune) ? ' en erreur' : ''
    }`,
    pathname: `/mes-jeunes/milo/${numeroDossier}`,
    refererUrl: context.req.headers.referer,
  })
  return { redirect: { destination, permanent: true } }
}

export default MiloFicheJeune
