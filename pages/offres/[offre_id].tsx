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
      <h2 className='text-base-bold'>{offre.titre}</h2>
      <p>{offre.nomEntreprise}</p>
      <p>{offre.localisation}</p>
      <p>{offre.typeContratLibelle}</p>
      {offre.salaire && <p>{offre.salaire}</p>}
      <p>{offre.horaires}</p>

      <h3 className='text-base-bold'>Détail de l’offre</h3>
      <p>{offre.description}</p>

      <h3 className='text-base-bold'>Profil souhaité</h3>
      <h4 className='text-base-bold'>Experiences</h4>
      <p>{offre.experiences}</p>

      <h4 className='text-base-bold'>Savoir et savoir faire</h4>
      {offre.competences.length > 0 && (
        <ul>
          {offre.competences.map((competence) => (
            <li key={competence.libelle}>{competence.libelle}</li>
          ))}
        </ul>
      )}
      <h4>Savoir être professionnel</h4>
      {offre.competencesProfessionnelles.length > 0 && (
        <ul>
          {offre.competencesProfessionnelles.map((competencePro) => (
            <li key={competencePro.libelle}>{competencePro.libelle}</li>
          ))}
        </ul>
      )}
      <h4 className='text-base-bold'>Formation</h4>
      {offre.formations.length > 0 && (
        <ul>
          {offre.formations.map((uneFormation) => (
            <li key={uneFormation.libelle}>{uneFormation.libelle}</li>
          ))}
        </ul>
      )}
      <h4 className='text-base-bold'>Langue</h4>
      {offre.langues.length > 0 && (
        <ul>
          {offre.langues.map((uneLangue) => (
            <li key={uneLangue.libelle}>{uneLangue.libelle}</li>
          ))}
        </ul>
      )}
      <h4 className='text-base-bold'>Permis</h4>
      {offre.permis.length > 0 && (
        <ul>
          {offre.permis.map((unPermis) => (
            <li key={unPermis.libelle}>{unPermis.libelle}</li>
          ))}
        </ul>
      )}
      <h3 className='text-base-bold'>Entreprise</h3>
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
