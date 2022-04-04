import { UserStructure } from 'interfaces/conseiller'
import { GetServerSideProps } from 'next'
import { JeunesService } from 'services/jeunes.service'
import withDependance from 'utils/injectionDependances/withDependance'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import useMatomo from '../../../utils/analytics/useMatomo'

type MiloFicheJeuneProps = {
  erreurMessageHttpMilo: string
}

function MiloFicheJeune({ erreurMessageHttpMilo }: MiloFicheJeuneProps) {
  useMatomo(
    erreurMessageHttpMilo
      ? 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune en erreur'
      : 'Création jeune SIMILO – Etape 1 - récuperation du dossier jeune'
  )

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
  let idJeune: string | undefined = ''
  let erreurMessageHttpMilo: string = ''

  try {
    idJeune = await jeunesServices.getIdJeuneMilo(
      context.query.numero_dossier as string,
      accessToken
    )
  } catch (err) {
    erreurMessageHttpMilo =
      (err as Error).message || "Une erreur inconnue s'est produite"
    console.log('Error in SSR: /mes-jeunes/milo/[numero_dossier]', err)
  }

  const destination = idJeune ? `/mes-jeunes/${idJeune}` : '/mes-jeunes'
  return {
    props: { erreurMessageHttpMilo },
    redirect: { destination, permanent: true },
  }
}

export default MiloFicheJeune
