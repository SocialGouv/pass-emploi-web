import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useEffect, useState } from 'react'

import FormRechercheOffres from 'components/offres/FormRechercheOffres'
import ResultatsRechercheOffre from 'components/offres/ResultatsRechercheOffres'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import {
  BaseOffre,
  BaseOffreEmploi,
  BaseServiceCivique,
  MetadonneesOffres,
  TypeOffre,
} from 'interfaces/offre'
import { PageProps } from 'interfaces/pageProps'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import {
  OffresEmploiService,
  SearchOffresEmploiQuery,
} from 'services/offres-emploi.service'
import { ReferentielService } from 'services/referentiel.service'
import {
  SearchServicesCiviquesQuery,
  ServicesCiviquesService,
} from 'services/services-civiques.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'

type WithHasError<T> = T & { hasError: boolean }
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

  const [typeOffre, setTypeOffre] = useState<TypeOffre | undefined>()
  const [queryOffresEmploi, setQueryOffresEmploi] = useState<
    WithHasError<SearchOffresEmploiQuery>
  >({ hasError: false })
  const [queryServicesCiviques, setQueryServicesCiviques] = useState<
    WithHasError<SearchServicesCiviquesQuery>
  >({ hasError: false })

  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [searchError, setSearchError] = useState<string | undefined>()
  const [offres, setOffres] = useState<BaseOffre[] | undefined>(undefined)
  const [nbTotal, setNbTotal] = useState<number | undefined>(0)
  const [pageCourante, setPageCourante] = useState<number>(0)
  const [nbPages, setNbPages] = useState<number>(0)

  const pageTracking: string = 'Recherche offres emploi'
  let initialTracking: string = pageTracking
  if (partageSuccess) initialTracking += ' - Partage offre succès'
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
      let result
      switch (typeOffre) {
        case TypeOffre.EMPLOI:
          result = await rechercherOffresEmploi(page)
          break
        case TypeOffre.SERVICE_CIVIQUE:
          result = await rechercherServicesCiviques(page)
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
    } catch {
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

  async function rechercherServicesCiviques(page: number): Promise<{
    offres: BaseServiceCivique[]
    metadonnees: MetadonneesOffres
  }> {
    const { hasError, ...query } = queryServicesCiviques
    return servicesCiviquesService.searchServicesCiviques(query, page)
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
  }, [queryOffresEmploi, queryServicesCiviques])

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
        isSearching={isSearching}
        hasResults={offres !== undefined}
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
        onNouvelleRecherche={rechercherPremierePage}
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
    props.partageSuccess =
      context.query[QueryParam.partageOffre] === QueryValue.succes

  return { props }
}

export default withTransaction(RechercheOffres.name, 'page')(RechercheOffres)
