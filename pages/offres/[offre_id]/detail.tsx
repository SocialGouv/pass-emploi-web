import { withTransaction } from '@elastic/apm-rum-react'

import { OffreEmploiItem } from 'interfaces/offre-emploi'
import { PageProps } from 'interfaces/pageProps'

type DetailOffreProps = PageProps & {
  offre: OffreEmploiItem
  returnTo: string
}

function DetailOffre({ offre }: DetailOffreProps) {
  return (
    <>
      <h2>{offre.titre}</h2>
    </>
  )
}

export default withTransaction(DetailOffre.name, 'page')(DetailOffre)
