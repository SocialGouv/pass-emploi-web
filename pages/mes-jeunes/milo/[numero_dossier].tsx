import { GetServerSideProps } from 'next'

import { StructureConseiller } from 'interfaces/conseiller'

function MiloFicheJeune() {
  return null
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const { user, accessToken } = sessionOrRedirect.session
  if (user.structure !== StructureConseiller.MILO) {
    return { redirect: { destination: '/mes-jeunes', permanent: false } }
  }

  const numeroDossier = context.query.numero_dossier as string

  const { getIdJeuneMilo } = await import('services/jeunes.service')
  const idJeune = await getIdJeuneMilo(numeroDossier, accessToken)

  const { trackSSR } = await import('utils/analytics/matomo')
  trackSSR({
    structure: StructureConseiller.MILO,
    customTitle: `Détail jeune par numéro dossier${
      !Boolean(idJeune) ? ' en erreur' : ''
    }`,
    avecBeneficiaires: idJeune ? 'oui' : 'non',
    pathname: `/mes-jeunes/milo/${numeroDossier}`,
    refererUrl: context.req.headers.referer,
  })

  const destination = idJeune ? `/mes-jeunes/${idJeune}` : '/mes-jeunes'
  return { redirect: { destination, permanent: false } }
}

export default MiloFicheJeune
