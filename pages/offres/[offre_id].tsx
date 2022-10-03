import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import { useMemo } from 'react'

import { DetailOffreEmploi } from 'interfaces/offre-emploi'
import { PageProps } from 'interfaces/pageProps'
import { OffresEmploiService } from 'services/offres-emploi.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { toFrenchFormat, WEEKDAY_MONTH_LONG } from 'utils/date'
import withDependance from 'utils/injectionDependances/withDependance'

type DetailOffreProps = PageProps & {
  offre: DetailOffreEmploi
}

function DetailOffre({ offre }: DetailOffreProps) {
  const dateActualisation = useMemo(
    () =>
      toFrenchFormat(
        DateTime.fromISO(offre.dateActualisation),
        WEEKDAY_MONTH_LONG
      ),
    [offre.dateActualisation]
  )

  return (
    <>
      <p>Actualisée le {dateActualisation}</p>
      <h2 className='text-base-bold'>{offre.titre}</h2>

      <section aria-labelledby='heading-info'>
        <h3 id='heading-info' className='sr-only'>
          Informations de l&apos;offre
        </h3>

        <dl>
          <dt className='sr-only'>Entreprise</dt>
          <dd>{offre.nomEntreprise}</dd>

          <dt className='sr-only'>Localisation</dt>
          <dd>{offre.localisation}</dd>

          <dt className='sr-only'>Type de contrat</dt>
          <dd>{offre.typeContratLibelle}</dd>

          {offre.salaire && (
            <>
              <dt className='sr-only'>Salaire</dt>
              <dd>{offre.salaire}</dd>
            </>
          )}

          {offre.horaires && (
            <>
              <dt className='sr-only'>Horaires</dt>
              <dd>{offre.horaires}</dd>
            </>
          )}
        </dl>
      </section>

      <section aria-labelledby='heading-detail'>
        <h3 id='heading-detail' className='text-base-bold'>
          Détail de l’offre
        </h3>

        <p className='whitespace-pre-wrap'>{offre.description}</p>
      </section>

      <section aria-labelledby='heading-profil'>
        <h3 id='heading-profil' className='text-base-bold'>
          Profil souhaité
        </h3>

        <dl>
          <dt>Expériences</dt>
          <dd>{offre.experience}</dd>

          {offre.competences.length > 0 && (
            <>
              <dt>Savoir et savoir faire</dt>
              <dd>
                <ul>
                  {offre.competences.map((competence) => (
                    <li key={competence}>{competence}</li>
                  ))}
                </ul>
              </dd>
            </>
          )}

          {offre.competencesProfessionnelles.length > 0 && (
            <>
              <dt>Savoir être professionnel</dt>
              <dd>
                <ul>
                  {offre.competencesProfessionnelles.map((competencePro) => (
                    <li key={competencePro}>{competencePro}</li>
                  ))}
                </ul>
              </dd>
            </>
          )}

          {offre.formations.length > 0 && (
            <>
              <dt>Formation</dt>
              <dd>
                <ul>
                  {offre.formations.map((formation) => (
                    <li key={formation}>{formation}</li>
                  ))}
                </ul>
              </dd>
            </>
          )}

          {offre.langues.length > 0 && (
            <>
              <dt>Langue</dt>
              <dd>
                <ul>
                  {offre.langues.map((langue) => (
                    <li key={langue}>{langue}</li>
                  ))}
                </ul>
              </dd>
            </>
          )}

          {offre.permis.length > 0 && (
            <>
              <dt>Permis</dt>
              <dd>
                <ul>
                  {offre.permis.map((permis) => (
                    <li key={permis}>{permis}</li>
                  ))}
                </ul>
              </dd>
            </>
          )}
        </dl>
      </section>

      <section aria-labelledby='heading-entreprise'>
        <h3 id='heading-entreprise'>
          <span className='sr-only'>Informations de l&apos;</span>Entreprise
        </h3>

        <dl>
          {offre.infoEntreprise.lien && (
            <>
              <dt className='sr-only'>Lien site</dt>
              <dd>
                <a href={offre.infoEntreprise.lien}>
                  {offre.infoEntreprise.lien}
                </a>
              </dd>
            </>
          )}

          {offre.infoEntreprise.adaptee !== undefined && (
            <>
              <dt>Entreprise adaptée</dt>
              <dd>{offre.infoEntreprise.adaptee ? 'OUI' : 'NON'}</dd>
            </>
          )}

          {offre.infoEntreprise.accessibleTH !== undefined && (
            <>
              <dt>Entreprise handi-bienveillante</dt>
              <dd>{offre.infoEntreprise.accessibleTH ? 'OUI' : 'NON'}</dd>
            </>
          )}

          {offre.infoEntreprise.detail && (
            <>
              <dt>Détail de l&apos;entreprise</dt>
              <dd>{offre.infoEntreprise.detail}</dd>
            </>
          )}
        </dl>
      </section>
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
