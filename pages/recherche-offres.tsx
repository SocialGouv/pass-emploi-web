import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useEffect, useState } from 'react'

import FormRechercheOffres from 'components/offres/FormRechercheOffres'
import ResultatsRechercheOffre from 'components/offres/ResultatsRechercheOffres'
import PartageRechercheButton from 'components/offres/suggestions/PartageRechercheButton'
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
import { useDependance } from 'utils/injectionDependances'

type RechercheOffresProps = PageProps & {
  partageOffreSuccess?: boolean
  suggestionRechercheSuccess?: boolean
}

function RechercheOffres({
  partageOffreSuccess,
  suggestionRechercheSuccess,
}: RechercheOffresProps) {
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
  const [typeOffre, setTypeOffre] = useState<TypeOffre | undefined>()
  const [queryOffresEmploi, setQueryOffresEmploi] = useState<
    FormValues<SearchOffresEmploiQuery>
  >({ hasError: false })
  const [queryServicesCiviques, setQueryServicesCiviques] = useState<
    FormValues<SearchServicesCiviquesQuery>
  >({ hasError: false })
  const [queryImmersions, setQueryImmersions] = useState<
    FormValues<SearchImmersionsQuery>
  >({
    rayon: RAYON_DEFAULT,
    hasError: false,
  })

  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [searchError, setSearchError] = useState<string | undefined>()
  const [offres, setOffres] = useState<BaseOffre[] | undefined>(undefined)
  const [nbTotal, setNbTotal] = useState<number | undefined>(0)
  const [pageCourante, setPageCourante] = useState<number>(0)
  const [nbPages, setNbPages] = useState<number>(0)

  const pageTracking: string = 'Recherche offres emploi'
  let initialTracking: string = pageTracking
  if (partageOffreSuccess) initialTracking += ' - Partage offre succès'
  if (suggestionRechercheSuccess)
    initialTracking += ' - Partage critères recherche succès'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  async function rechercherPremierePage() {
    nettoyerResultats()
    rechercherOffres({ page: 1 })
  }

  async function rechercherOffres({ page }: { page: number }) {
    if (page === pageCourante) return
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
      setNbTotal(nombreTotal)
      setPageCourante(page)
      setNbPages(nombrePages)
      setTrackingTitle(pageTracking + ' - Résultats')
    } catch (e) {
      console.error(e)
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

  async function rechercherOffresEmploi(page: number): Promise<{
    offres: BaseOffreEmploi[]
    metadonnees: MetadonneesOffres
  }> {
    return offresEmploiService.searchOffresEmploi(getQueryOffreEmploi(), page)
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
    setNbTotal(undefined)
    setPageCourante(0)
    setNbPages(0)
    setSearchError(undefined)
  }

  useEffect(() => {
    nettoyerResultats()
  }, [queryOffresEmploi, queryServicesCiviques, queryImmersions])

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
        stateTypeOffre={[typeOffre, setTypeOffre]}
        stateQueryOffresEmploi={[queryOffresEmploi, setQueryOffresEmploi]}
        stateQueryServicesCiviques={[
          queryServicesCiviques,
          setQueryServicesCiviques,
        ]}
        stateQueryImmersions={[queryImmersions, setQueryImmersions]}
        onNouvelleRecherche={rechercherPremierePage}
      />
      <PartageRechercheButton
        typeOffre={typeOffre}
        suggestionOffreEmploi={getQueryOffreEmploi()}
      />
      <ResultatsRechercheOffre
        isSearching={isSearching}
        offres={offres}
        pageCourante={pageCourante}
        nbTotal={nbTotal}
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
    props.partageOffreSuccess =
      context.query[QueryParam.partageOffre] === QueryValue.succes

  if (context.query[QueryParam.suggestionRecherche])
    props.suggestionRechercheSuccess =
      context.query[QueryParam.suggestionRecherche] === QueryValue.succes

  return { props }
}

export default withTransaction(RechercheOffres.name, 'page')(RechercheOffres)
