import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useEffect, useState } from 'react'

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
import { useDependance } from 'utils/injectionDependances'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { ButtonStyle } from 'components/ui/Button/Button'

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
  const [typeOffre, setTypeOffre] = useState<TypeOffre | undefined>()
  const [queryOffresEmploi, setQueryOffresEmploi] = useState<
    FormValues<SearchOffresEmploiQuery>
  >({ hasError: false })
  const [queryServicesCiviques, setQueryServicesCiviques] = useState<
    FormValues<SearchServicesCiviquesQuery>
  >({ hasError: false })
  const [queryImmersions, setQueryImmersions] = useState<
    FormValues<SearchImmersionsQuery>
  >({ rayon: RAYON_DEFAULT, hasError: false })

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
    setNbTotal(undefined)
    setPageCourante(0)
    setNbPages(0)
    setSearchError(undefined)
  }

  useEffect(() => {
    nettoyerResultats()
  }, [queryOffresEmploi, queryServicesCiviques, queryImmersions])

  useMatomo(trackingTitle)

  function getCriteresRecherche() {
    const query =
      '{ "q": "élévation", "departement": "à paris", "alternance": true, "experience": [ "1" ], "debutant Accepte": true, "contrat": [ "CDI" ], "duree": [ "1" ], "commune": "string", "rayon": 0 }'

    return new Buffer(query).toString('base64')
  }

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
      {/*
      TODO-1027
      - Un seul composant, avec ses règles d'affichage à gérer (mais où ? plutôt dans le composant ?)
      - Un type d'offre
      - Un Query selon le type d'offre
      */}
      {typeOffre === TypeOffre.EMPLOI &&
        (queryOffresEmploi.commune || queryOffresEmploi.departement) && (
          <div className='flex justify-end align-center'>
            <p className='my-auto mr-4'>
              Partager cette recherche à vos bénéficiaires
            </p>
            <ButtonLink
              href={
                '/offres/partage-critere?criteres=' + getCriteresRecherche()
              }
              style={ButtonStyle.SECONDARY}
            >
              <IconComponent
                name={IconName.Partage}
                className='w-4 h-4 mr-3'
                focusable={false}
                aria-hidden={true}
              />
              Partager <span className='sr-only'>critères de recherche</span>
            </ButtonLink>
          </div>
        )}
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
