import { UserStructure } from 'interfaces/conseiller'
import { GetServerSideProps } from 'next'
import { JeunesService } from 'services/jeunes.service'
import withDependance from 'utils/injectionDependances/withDependance'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'

function MiloFicheJeune() {
  return <></>
}

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.hasSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const { user, accessToken } = sessionOrRedirect.session
  if (user.structure !== UserStructure.MILO) {
    return { redirect: { destination: '/mes-jeunes', permanent: true } }
  }

  const jeunesServices = withDependance<JeunesService>('jeunesService')
  const idJeune = await jeunesServices.getIdJeuneMilo(
    context.query.numero_dossier as string,
    accessToken
  )
  const destination = idJeune ? `/mes-jeunes/${idJeune}` : '/mes-jeunes'
  return {
    redirect: { destination, permanent: true },
  }
}

export default MiloFicheJeune
