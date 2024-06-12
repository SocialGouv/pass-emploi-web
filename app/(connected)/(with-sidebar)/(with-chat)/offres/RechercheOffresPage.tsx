'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import isEqual from 'lodash.isequal'
import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'

import FormRechercheOffres from 'components/offres/FormRechercheOffres'
import PartageRechercheButton from 'components/offres/suggestions/PartageRechercheButton'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import {
  BaseImmersion,
  BaseOffre,
  BaseOffreEmploi,
  BaseServiceCivique,
  TypeOffre,
} from 'interfaces/offre'
import { AlerteParam } from 'referentiel/alerteParam'
import { SearchImmersionsQuery } from 'services/immersions.service'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'
import { SearchServicesCiviquesQuery } from 'services/services-civiques.service'
import { FormValues } from 'types/form'
import { MetadonneesPagination } from 'types/pagination'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useSessionStorage } from 'utils/hooks/useSessionStorage'
import { usePortefeuille } from 'utils/portefeuilleContext'

const ResultatsRechercheOffre = dynamic(
  () => import('components/offres/ResultatsRechercheOffres')
)

function RechercheOffresPage() {
  const [alerte] = useAlerte()
  const [portefeuille] = usePortefeuille()

  const RAYON_DEFAULT = 10
  const [collapsed, setCollapsed] = useState<boolean>(false)
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
      const { getOffreEmploiClientSide } = await import(
        'services/offres-emploi.service'
      )
      const offre = await getOffreEmploiClientSide(queryOffresEmploi.idOffre)

      return {
        offres: offre ? [offre] : [],
        metadonnees: {
          nombreTotal: offre ? 1 : 0,
          nombrePages: offre ? 1 : 0,
        },
      }
    }

    const { searchOffresEmploi } = await import(
      'services/offres-emploi.service'
    )
    return searchOffresEmploi(getQueryOffreEmploi(), page)
  }

  async function rechercherAlternances(page: number): Promise<{
    offres: BaseOffreEmploi[]
    metadonnees: MetadonneesPagination
  }> {
    if (queryOffresEmploi.idOffre) {
      const { getOffreEmploiClientSide } = await import(
        'services/offres-emploi.service'
      )
      const offre = await getOffreEmploiClientSide(queryOffresEmploi.idOffre)

      return {
        offres: offre ? [offre] : [],
        metadonnees: {
          nombreTotal: offre ? 1 : 0,
          nombrePages: offre ? 1 : 0,
        },
      }
    }

    const { searchAlternances } = await import('services/offres-emploi.service')
    return searchAlternances(getQueryOffreEmploi(), page)
  }

  async function rechercherServicesCiviques(page: number): Promise<{
    offres: BaseServiceCivique[]
    metadonnees: MetadonneesPagination
  }> {
    const { searchServicesCiviques } = await import(
      'services/services-civiques.service'
    )
    return searchServicesCiviques(getQueryServiceCivique(), page)
  }

  async function rechercherImmersions(page: number): Promise<{
    offres: BaseImmersion[]
    metadonnees: MetadonneesPagination
  }> {
    const { searchImmersions } = await import('services/immersions.service')
    return searchImmersions(getQueryImmersion(), page)
  }

  async function fetchMetiers(query: string) {
    const { getMetiers: _getMetiers } = await import(
      'services/referentiel.service'
    )
    return _getMetiers(query)
  }

  async function fetchCommunes(query: string) {
    const { getCommunes: _getCommunes } = await import(
      'services/referentiel.service'
    )
    return _getCommunes(query)
  }

  async function fetchCommunesEtDepartements(query: string) {
    const { getCommunesEtDepartements: _getCommunesEtDepartements } =
      await import('services/referentiel.service')
    return _getCommunesEtDepartements(query)
  }

  function nettoyerResultats() {
    setOffres(undefined)
    setNbTotalOffres(undefined)
    setPageCourante(0)
    setNbPages(0)
    setSearchError(undefined)
  }

  function typeOffreToTitle(type: TypeOffre) {
    switch (type) {
      case TypeOffre.EMPLOI:
        return 'd’emploi'
      case TypeOffre.SERVICE_CIVIQUE:
        return 'de service civique'
      case TypeOffre.IMMERSION:
        return 'd’immersion'
      case TypeOffre.ALTERNANCE:
        return 'd’alternance'
    }
  }

  useEffect(() => {
    const postfix = document.title.split(' - ').at(-1)
    document.title =
      (pageCourante > 0 ? `Page ${pageCourante} - ` : '') +
      `Recherche d’offres ${typeOffre ? typeOffreToTitle(typeOffre) + ' ' : ''}- ${postfix}`
  }, [typeOffre, pageCourante])

  useMatomo(trackingTitle, portefeuille.length > 0)

  return (
    <>
      {searchError && (
        <FailureAlert
          label={searchError}
          onAcknowledge={() => setSearchError(undefined)}
        />
      )}

      <div className='bg-primary_lighten p-6 mb-10 rounded-base'>
        <div className={`flex justify-between ${collapsed ? '' : 'mb-5'}`}>
          <h2 className='text-m-medium text-primary'>Ma recherche</h2>
          <button
            type='button'
            onClick={() => setCollapsed(!collapsed)}
            className='p-2 hover:bg-blanc hover:rounded-l'
          >
            <IconComponent
              name={collapsed ? IconName.ChevronDown : IconName.ChevronUp}
              title={`${collapsed ? 'Voir' : 'Cacher'} les critères`}
              className='h-6 w-6 fill-primary'
              focusable={false}
            />
            <span className='sr-only'>
              {collapsed ? 'Voir' : 'Cacher'} les critères
            </span>
          </button>
        </div>
        <FormRechercheOffres
          hasResults={isSearching || offres !== undefined}
          collapsed={collapsed}
          fetchMetiers={fetchMetiers}
          fetchCommunes={fetchCommunes}
          fetchCommunesEtDepartements={fetchCommunesEtDepartements}
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
          primary={collapsed}
          typeOffre={typeOffre}
          suggestionOffreEmploi={getQueryOffreEmploi()}
          suggestionImmersion={getQueryImmersion()}
          suggestionServiceCivique={getQueryServiceCivique()}
        />
      </div>

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

export default withTransaction(
  RechercheOffresPage.name,
  'page'
)(RechercheOffresPage)
