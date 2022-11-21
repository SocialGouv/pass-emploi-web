import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'

import { StructureConseiller } from '../../../interfaces/conseiller'
import { Evenement } from '../../../interfaces/evenement'
import { EvenementsService } from '../../../services/evenements.service'
import { withMandatorySessionOrRedirect } from '../../../utils/auth/withMandatorySessionOrRedirect'
import withDependance from '../../../utils/injectionDependances/withDependance'

import { PageProps } from 'interfaces/pageProps'

interface ClotureProps extends PageProps {
  returnTo: string
  evenement: Evenement
}

function Cloture({ evenement }: ClotureProps) {
  return <div>Hello world {evenement.titre}</div>
}

export const getServerSideProps: GetServerSideProps<ClotureProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  if (user.structure === StructureConseiller.POLE_EMPLOI)
    return {
      redirect: { destination: '/mes-jeunes', permanent: false },
    }

  const rendezVousService =
    withDependance<EvenementsService>('rendezVousService')

  const idEvenement = context.query.evenement_id as string

  const evenement = await rendezVousService.getDetailsEvenement(
    idEvenement,
    accessToken
  )
  if (!evenement) return { notFound: true }

  const referer = context.req.headers.referer
  const redirectTo =
    referer && !comingFromHome(referer) ? referer : '/mes-jeunes'

  const props: ClotureProps = {
    evenement,
    returnTo: redirectTo,
    pageTitle: 'Mes événements - Cloturer',
    pageHeader: 'Cloturer l’animation collective',
  }

  return { props }
}

export default withTransaction(Cloture.name, 'page')(Cloture)

function comingFromHome(referer: string): boolean {
  return referer.split('?')[0].endsWith('/index')
}
