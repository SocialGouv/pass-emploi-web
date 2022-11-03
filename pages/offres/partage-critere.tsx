import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'

import { TypeOffre } from 'interfaces/offre'
import { PageProps } from 'interfaces/pageProps'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'

type PartageCritereProps = PageProps & {
  type: TypeOffre
  criteresDeRecherche: SearchOffresEmploiQuery
}

function PartageCritere({ criteresDeRecherche }: PartageCritereProps) {
  return (
    <div>
      {criteresDeRecherche.motsCles +
        ' ' +
        criteresDeRecherche.durees +
        ' ' +
        criteresDeRecherche.typesContrats +
        ' ' +
        criteresDeRecherche.commune?.libelle +
        ' ' +
        criteresDeRecherche.departement}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<
  PartageCritereProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const criteresEncoded = context.query.criteres as string
  const buff = new Buffer(criteresEncoded, 'base64')
  const criteresDecoded = buff.toString('utf-8')

  const queryOffresEmploiJson = JSON.parse(criteresDecoded)

  const queryOffresEmploi: SearchOffresEmploiQuery = {
    ...queryOffresEmploiJson,
    //TODO-1027 Objet vide ou undefined ?
    departement: queryOffresEmploiJson.departement
      ? JSON.parse(queryOffresEmploiJson.departement)
      : {},
    commune: queryOffresEmploiJson.commune
      ? JSON.parse(queryOffresEmploiJson.commune)
      : {},
  }

  const props: PartageCritereProps = {
    pageTitle: 'Partager une offre',
    type: context.query.type as TypeOffre,
    criteresDeRecherche: queryOffresEmploi,
  }

  return { props }
}

export default withTransaction(PartageCritere.name, 'page')(PartageCritere)
