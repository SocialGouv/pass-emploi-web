import { withTransaction } from '@elastic/apm-rum-react'

import { DetailOffreEmploi, OffreEmploiItem } from 'interfaces/offre-emploi'
import { PageProps } from 'interfaces/pageProps'
import { GetServerSideProps } from 'next'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'
import { OffresEmploiService } from 'services/offres-emploi.service'

type DetailOffreProps = PageProps & {
  offre: DetailOffreEmploi
  returnTo: string
}

function DetailOffre({ offre }: DetailOffreProps) {
  return (
    <>
      <p>{offre.dateActualisation}</p>
      <h2>{offre.titre}</h2>
      <p>{offre.nomEntreprise}</p>
      <p>{offre.localisation}</p>
      <p>{offre.typeContrat}</p>
      {offre.salaire && <p>{offre.salaire}</p>}
      <p>{offre.horaires}</p>
      <p>{offre.description}</p>

      <h3>Détail de l’offre</h3>
      <h3>Profil souhaité</h3>
      <h3>Entreprise</h3>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<DetailOffreProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const { accessToken } = sessionOrRedirect.session
  const offresEmploiService = withDependance<OffresEmploiService>(
    'offresEmploiService'
  )

  const offre = await offresEmploiService.getOffreEmploiServerSide(
    context.query.offre_id as string,
    accessToken
  )
  if (!offre) return { notFound: true }

  return {
    props: {
      offre,
      pageTitle: 'Détail de l‘offre',
      pageHeader: `Offre n°${offre.id}`,
    },
  }
}

export default withTransaction(DetailOffre.name, 'page')(DetailOffre)
