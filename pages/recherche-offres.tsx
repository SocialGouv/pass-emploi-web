import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'

import FormRechercheOffres from 'components/offres/FormRechercheOffres'
import ResultatsRechercheOffre from 'components/offres/ResultatsRechercheOffres'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import {
  BaseImmersion,
  BaseOffre,
  BaseOffreEmploi,
  BaseServiceCivique,
  MetadonneesOffres,
  TypeOffre,
} from 'interfaces/offre'
import { PageProps } from 'interfaces/pageProps'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import {
  ImmersionsService,
  SearchImmersionsQuery,
} from 'services/immersions.service'
import {
  OffresEmploiService,
  SearchOffresEmploiQuery,
} from 'services/offres-emploi.service'
import { ReferentielService } from 'services/referentiel.service'
import {
  SearchServicesCiviquesQuery,
  ServicesCiviquesService,
} from 'services/services-civiques.service'
import { FormValues } from 'types/form'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useSessionStorage } from 'utils/hooks/useSessionStorage'
import { useDependance } from 'utils/injectionDependances'

type RechercheOffresProps = PageProps & {
  partageSuccess?: boolean
}
function RechercheOffres({ partageSuccess }: RechercheOffresProps) {
  const referentielService =
    useDependance<ReferentielService>('referentielService')
  const offresEmploiService = useDependance<OffresEmploiService>(
    'offresEmploiService'
  )
  const servicesCiviquesService = useDependance<ServicesCiviquesService>(
    'servicesCiviquesService'
  )
  const immersionsService =
    useDependance<ImmersionsService>('immersionsService')

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
  if (partageSuccess) initialTracking += ' - Partage offre succès'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

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
    if (JSON.stringify(query) !== JSON.stringify(queryOffresEmploi)) {
      nettoyerResultats()
    }
    setQueryOffresEmploi(query)
  }

  function updateQueryServicesCiviques(
    query: FormValues<SearchServicesCiviquesQuery>
  ) {
    if (JSON.stringify(query) !== JSON.stringify(queryServicesCiviques)) {
      nettoyerResultats()
    }
    setQueryServicesCiviques(query)
  }

  function updateQueryImmersions(query: FormValues<SearchImmersionsQuery>) {
    console.log('>>>', { query })
    if (JSON.stringify(query) !== JSON.stringify(queryImmersions)) {
      nettoyerResultats()
    }
    setQueryImmersions(query)
  }

  async function rechercherPremierePage() {
    rechercherOffres({ page: 1 })
  }

  async function rechercherOffres({ page }: { page: number }) {
    if (isSearching) return
    if (!typeOffre) return

    setIsSearching(true)
    try {
      let result: { offres: BaseOffre[]; metadonnees: MetadonneesOffres }
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
      console.error(e)
      nettoyerResultats()
      setSearchError('Une erreur est survenue. Vous pouvez réessayer')
      setTrackingTitle(pageTracking + ' - Erreur')
    } finally {
      setIsSearching(false)
    }
  }

  async function rechercherOffresEmploi(page: number): Promise<{
    offres: BaseOffreEmploi[]
    metadonnees: MetadonneesOffres
  }> {
    const { hasError, ...query } = queryOffresEmploi
    return offresEmploiService.searchOffresEmploi(query, page)
  }

  async function rechercherAlternances(page: number): Promise<{
    offres: BaseOffreEmploi[]
    metadonnees: MetadonneesOffres
  }> {
    const { hasError, ...query } = queryOffresEmploi
    return offresEmploiService.searchAlternances(query, page)
  }

  async function rechercherServicesCiviques(page: number): Promise<{
    offres: BaseServiceCivique[]
    metadonnees: MetadonneesOffres
  }> {
    const { hasError, ...query } = queryServicesCiviques
    return servicesCiviquesService.searchServicesCiviques(query, page)
  }

  async function rechercherImmersions(page: number): Promise<{
    offres: BaseImmersion[]
    metadonnees: MetadonneesOffres
  }> {
    const { hasError, ...query } = queryImmersions
    return immersionsService.searchImmersions(
      query as SearchImmersionsQuery,
      page
    )
  }

  function nettoyerResultats() {
    setOffres(undefined)
    setNbTotalOffres(undefined)
    setPageCourante(0)
    setNbPages(0)
    setSearchError(undefined)
  }

  useMatomo(trackingTitle)

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
        fetchMetiers={referentielService.getMetiers.bind(referentielService)}
        fetchCommunes={referentielService.getCommunes.bind(referentielService)}
        fetchCommunesEtDepartements={referentielService.getCommunesEtDepartements.bind(
          referentielService
        )}
        stateTypeOffre={[typeOffre, switchTypeOffre]}
        stateQueryOffresEmploi={[queryOffresEmploi, updateQueryEmplois]}
        stateQueryServicesCiviques={[
          queryServicesCiviques,
          updateQueryServicesCiviques,
        ]}
        stateQueryImmersions={[queryImmersions, updateQueryImmersions]}
        onNouvelleRecherche={rechercherPremierePage}
      />
      <ResultatsRechercheOffre
        isSearching={isSearching}
        offres={offres}
        pageCourante={pageCourante}
        nbTotal={nbTotalOffres}
        nbPages={nbPages}
        onChangerPage={(page) => rechercherOffres({ page })}
      />
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  RechercheOffresProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const props: RechercheOffresProps = {
    pageTitle: 'Recherche d’offres',
    pageHeader: 'Offres',
  }

  if (context.query[QueryParam.partageOffre])
    props.partageSuccess =
      context.query[QueryParam.partageOffre] === QueryValue.succes

  return { props }
}

export default withTransaction(RechercheOffres.name, 'page')(RechercheOffres)
