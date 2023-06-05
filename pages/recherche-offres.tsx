import { withTransaction } from '@elastic/apm-rum-react'
import isEqual from 'lodash.isequal'
import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import React, { useState } from 'react'

import FormRechercheOffres from 'components/offres/FormRechercheOffres'
import PartageRechercheButton from 'components/offres/suggestions/PartageRechercheButton'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import {
  BaseImmersion,
  BaseOffre,
  BaseOffreEmploi,
  BaseServiceCivique,
  TypeOffre,
} from 'interfaces/offre'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import {
  searchImmersions,
  SearchImmersionsQuery,
} from 'services/immersions.service'
import {
  getOffreEmploiClientSide,
  searchAlternances,
  searchOffresEmploi,
  SearchOffresEmploiQuery,
} from 'services/offres-emploi.service'
import {
  getCommunes,
  getCommunesEtDepartements,
  getMetiers,
} from 'services/referentiel.service'
import {
  searchServicesCiviques,
  SearchServicesCiviquesQuery,
} from 'services/services-civiques.service'
import { FormValues } from 'types/form'
import { MetadonneesPagination } from 'types/pagination'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useSessionStorage } from 'utils/hooks/useSessionStorage'
import { usePortefeuille } from 'utils/portefeuilleContext'

const ResultatsRechercheOffre = dynamic(
  import('components/offres/ResultatsRechercheOffres')
)

function RechercheOffres(_: PageProps) {
  const [alerte] = useAlerte()
  const [portefeuille] = usePortefeuille()

  const RAYON_DEFAULT = 10
  const [typeOffre, setTypeOffre] = useSessionStorage<TypeOffre | undefined>(
    'recherche-offres--type',
    undefined
  )
  const [queryOffresEmploi, setQueryOffresEmploi] = useSessionStorage<
    FormValues<SearchOffresEmploiQuery>
  >('recherche-offres--query--emploi', { hasError: false })
  const [queryServicesCiviques, setQueryServicesCiviques] = useSessionStorage<
    FormValues<SearchServicesCiviquesQuery>
  >('recherche-offres--query--service-civique', { hasError: false })
  const [queryImmersions, setQueryImmersions] = useSessionStorage<
    FormValues<SearchImmersionsQuery>
  >('recherche-offres--query--immersion', {
    rayon: RAYON_DEFAULT,
    hasError: false,
  })

  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [searchError, setSearchError] = useState<string | undefined>()

  const [offres, setOffres] = useSessionStorage<BaseOffre[] | undefined>(
    'recherche-offres--resultats',
    undefined
  )
  const [nbTotalOffres, setNbTotalOffres] = useSessionStorage<
    number | undefined
  >('recherche-offres--resultats--nb-total-offres', 0)
  const [pageCourante, setPageCourante] = useSessionStorage<number>(
    'recherche-offres--resultats--page',
    0
  )
  const [nbPages, setNbPages] = useSessionStorage<number>(
    'recherche-offres--resultats--nb-pages',
    0
  )

  const pageTracking: string = 'Recherche offres emploi'
  let initialTracking: string = pageTracking
  if (alerte?.key === AlerteParam.partageOffre)
    initialTracking += ' - Partage offre succès'
  if (alerte?.key === AlerteParam.suggestionRecherche)
    initialTracking += ' - Partage critères recherche succès'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  function switchTypeOffre(type: TypeOffre) {
    nettoyerResultats()
    setQueryOffresEmploi({ hasError: false })
    setQueryServicesCiviques({ hasError: false })
    setQueryImmersions({
      rayon: 10,
      hasError: typeOffre === TypeOffre.IMMERSION,
    })
    setTypeOffre(type)
  }

  function updateQueryEmplois(query: FormValues<SearchOffresEmploiQuery>) {
    if (!isEqual(query, queryOffresEmploi)) {
      nettoyerResultats()
    }
    setQueryOffresEmploi(query)
  }

  function updateQueryServicesCiviques(
    query: FormValues<SearchServicesCiviquesQuery>
  ) {
    if (!isEqual(query, queryServicesCiviques)) {
      nettoyerResultats()
    }
    setQueryServicesCiviques(query)
  }

  function updateQueryImmersions(query: FormValues<SearchImmersionsQuery>) {
    if (!isEqual(query, queryImmersions)) {
      nettoyerResultats()
    }
    setQueryImmersions(query)
  }

  async function rechercherPremierePage() {
    rechercherOffres({ page: 1 })
  }

  async function rechercherOffres({ page }: { page: number }) {
    if (page === pageCourante) return
    if (isSearching) return
    if (!typeOffre) return

    setIsSearching(true)
    try {
      let result: { offres: BaseOffre[]; metadonnees: MetadonneesPagination }
      switch (typeOffre) {
        case TypeOffre.EMPLOI:
          result = await rechercherOffresEmploi(page)
          break
        case TypeOffre.ALTERNANCE:
          result = await rechercherAlternances(page)
          break
        case TypeOffre.SERVICE_CIVIQUE:
          result = await rechercherServicesCiviques(page)
          break
        case TypeOffre.IMMERSION:
          result = await rechercherImmersions(page)
          break
      }
      const {
        offres: offresPageCourante,
        metadonnees: { nombreTotal, nombrePages },
      } = result
      setOffres(offresPageCourante)
      setNbTotalOffres(nombreTotal)
      setPageCourante(page)
      setNbPages(nombrePages)
      setTrackingTitle(pageTracking + ' - Résultats')
    } catch (e) {
      nettoyerResultats()
      setSearchError('Une erreur est survenue. Vous pouvez réessayer')
      setTrackingTitle(pageTracking + ' - Erreur')
    } finally {
      setIsSearching(false)
    }
  }

  function getQueryOffreEmploi(): SearchOffresEmploiQuery {
    const { hasError, ...query } = queryOffresEmploi
    return query
  }

  function getQueryImmersion(): SearchImmersionsQuery {
    const { hasError, ...query } = queryImmersions
    return query as SearchImmersionsQuery
  }

  function getQueryServiceCivique(): SearchServicesCiviquesQuery {
    const { hasError, ...query } = queryServicesCiviques
    return query
  }

  async function rechercherOffresEmploi(page: number): Promise<{
    offres: BaseOffreEmploi[]
    metadonnees: MetadonneesPagination
  }> {
    if (queryOffresEmploi.idOffre) {
      const offre = await getOffreEmploiClientSide(queryOffresEmploi.idOffre)

      return {
        offres: offre ? [offre] : [],
        metadonnees: {
          nombreTotal: offre ? 1 : 0,
          nombrePages: offre ? 1 : 0,
        },
      }
    }
    return searchOffresEmploi(getQueryOffreEmploi(), page)
  }

  async function rechercherAlternances(page: number): Promise<{
    offres: BaseOffreEmploi[]
    metadonnees: MetadonneesPagination
  }> {
    if (queryOffresEmploi.idOffre) {
      const offre = await getOffreEmploiClientSide(queryOffresEmploi.idOffre)

      return {
        offres: offre ? [offre] : [],
        metadonnees: {
          nombreTotal: offre ? 1 : 0,
          nombrePages: offre ? 1 : 0,
        },
      }
    }
    return searchAlternances(getQueryOffreEmploi(), page)
  }

  async function rechercherServicesCiviques(page: number): Promise<{
    offres: BaseServiceCivique[]
    metadonnees: MetadonneesPagination
  }> {
    return searchServicesCiviques(getQueryServiceCivique(), page)
  }

  async function rechercherImmersions(page: number): Promise<{
    offres: BaseImmersion[]
    metadonnees: MetadonneesPagination
  }> {
    return searchImmersions(getQueryImmersion(), page)
  }

  function nettoyerResultats() {
    setOffres(undefined)
    setNbTotalOffres(undefined)
    setPageCourante(0)
    setNbPages(0)
    setSearchError(undefined)
  }

  useMatomo(trackingTitle, aDesBeneficiaires)

  return (
    <>
      {searchError && (
        <FailureAlert
          label={searchError}
          onAcknowledge={() => setSearchError(undefined)}
        />
      )}

      <FormRechercheOffres
        hasResults={isSearching || offres !== undefined}
        fetchMetiers={getMetiers}
        fetchCommunes={getCommunes}
        fetchCommunesEtDepartements={getCommunesEtDepartements}
        stateTypeOffre={[typeOffre, switchTypeOffre]}
        stateQueryOffresEmploi={[queryOffresEmploi, updateQueryEmplois]}
        stateQueryServicesCiviques={[
          queryServicesCiviques,
          updateQueryServicesCiviques,
        ]}
        stateQueryImmersions={[queryImmersions, updateQueryImmersions]}
        onNouvelleRecherche={rechercherPremierePage}
      />

      <PartageRechercheButton
        typeOffre={typeOffre}
        suggestionOffreEmploi={getQueryOffreEmploi()}
        suggestionImmersion={getQueryImmersion()}
        suggestionServiceCivique={getQueryServiceCivique()}
      />

      {(isSearching || offres) && (
        <ResultatsRechercheOffre
          isSearching={isSearching}
          offres={offres}
          pageCourante={pageCourante}
          nbTotal={nbTotalOffres}
          nbPages={nbPages}
          onChangerPage={(page) => rechercherOffres({ page })}
        />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const props: PageProps = {
    pageTitle: 'Recherche d’offres',
    pageHeader: 'Offres',
  }

  return { props }
}

export default withTransaction(RechercheOffres.name, 'page')(RechercheOffres)
