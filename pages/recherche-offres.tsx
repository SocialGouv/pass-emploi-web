import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { FormEvent, useEffect, useState } from 'react'

import RadioButton from 'components/action/RadioButton'
import RechercheOffresEmploiMain from 'components/offres/RechercheOffresEmploiMain'
import RechercheOffresEmploiSecondary from 'components/offres/RechercheOffresEmploiSecondary'
import RechercheServicesCiviquesMain from 'components/offres/RechercheServicesCiviquesMain'
import RechercheServicesCiviquesSecondary from 'components/offres/RechercheServicesCiviquesSecondary'
import ResultatsRechercheOffre from 'components/offres/ResultatsRechercheOffres'
import Button from 'components/ui/Button/Button'
import { Etape } from 'components/ui/Form/Etape'
import IconComponent, { IconName } from 'components/ui/IconComponent'
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
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false)

  const [countCriteres, setCountCriteres] = useState<number>(0)
  const [queryOffresEmploi, setQueryOffresEmploi] = useState<
    WithHasError<SearchOffresEmploiQuery>
  >({ hasError: false })
  const [queryServiceCivique, setQueryServiceCivique] = useState<
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

  const formIsInvalid =
    queryOffresEmploi.hasError || queryServiceCivique.hasError

  async function rechercherPremierePage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isSearching) return
    if (!typeOffre) return
    if (formIsInvalid) return
    nettoyerResultats()

    rechercherOffres(1)
  }

  async function rechercherOffres(page: number) {
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
    const { hasError, ...query } = queryServiceCivique
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
    setQueryOffresEmploi({ hasError: false })
    setQueryServiceCivique({ hasError: false })
  }, [typeOffre])

  useEffect(() => {
    nettoyerResultats()
  }, [queryOffresEmploi, queryServiceCivique])

  useMatomo(trackingTitle)

  return (
    <>
      {searchError && (
        <FailureAlert
          label={searchError}
          onAcknowledge={() => setSearchError(undefined)}
        />
      )}

      <form
        onSubmit={rechercherPremierePage}
        className={
          offres !== undefined || isSearching
            ? 'bg-primary_lighten p-6 mb-10 rounded-small'
            : ''
        }
      >
        <Etape numero={1} titre='Sélectionner un type d’offre'>
          <div className='flex flex-wrap'>
            <RadioButton
              isSelected={typeOffre === TypeOffre.EMPLOI}
              onChange={() => setTypeOffre(TypeOffre.EMPLOI)}
              name='type-offre'
              id='type-offre--emploi'
              label='Offre d’emploi'
            />
            <RadioButton
              isSelected={typeOffre === TypeOffre.SERVICE_CIVIQUE}
              onChange={() => setTypeOffre(TypeOffre.SERVICE_CIVIQUE)}
              name='type-offre'
              id='type-offre--service-civique'
              label='Service civique'
            />
          </div>
        </Etape>

        {getRechercheMain()}

        {typeOffre && (
          <div className='flex justify-end mb-6'>
            <button
              type='button'
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className='mr-12'
            >
              Voir {showMoreFilters ? 'moins' : 'plus'} de critères
              <IconComponent
                name={
                  showMoreFilters ? IconName.ChevronUp : IconName.ChevronDown
                }
                className='h-4 w-4 fill-primary inline ml-2'
                aria-hidden={true}
                focusable={false}
              ></IconComponent>
            </button>
          </div>
        )}

        {showMoreFilters && getRechercheSecondary()}

        {typeOffre && (
          <>
            <div className='mt-5 mb-4 text-center'>
              [{countCriteres}] critère{countCriteres > 1 && 's'} sélectionné
              {countCriteres > 1 && 's'}
            </div>

            <Button
              type='submit'
              className='mx-auto'
              disabled={formIsInvalid || isSearching}
            >
              <IconComponent
                name={IconName.Search}
                focusable={false}
                aria-hidden={true}
                className='w-4 h-4 mr-2'
              />
              Rechercher
            </Button>
          </>
        )}
      </form>

      <ResultatsRechercheOffre
        isSearching={isSearching}
        offres={offres}
        pageCourante={pageCourante}
        nbTotal={nbTotal}
        nbPages={nbPages}
        onChangerPage={rechercherOffres}
      />
    </>
  )

  function getRechercheMain(): JSX.Element | null {
    switch (typeOffre) {
      case TypeOffre.EMPLOI:
        return (
          <RechercheOffresEmploiMain
            fetchCommunesEtDepartements={referentielService.getCommunesEtDepartements.bind(
              referentielService
            )}
            query={queryOffresEmploi}
            onQueryUpdate={setQueryOffresEmploi}
          />
        )
      case TypeOffre.SERVICE_CIVIQUE:
        return (
          <RechercheServicesCiviquesMain
            fetchCommunes={referentielService.getCommunes.bind(
              referentielService
            )}
            query={queryServiceCivique}
            onQueryUpdate={setQueryServiceCivique}
          />
        )
      default:
        return null
    }
  }

  function getRechercheSecondary(): JSX.Element | null {
    switch (typeOffre) {
      case TypeOffre.EMPLOI:
        return (
          <RechercheOffresEmploiSecondary
            onCriteresChange={setCountCriteres}
            query={queryOffresEmploi}
            onQueryUpdate={setQueryOffresEmploi}
          />
        )
      case TypeOffre.SERVICE_CIVIQUE:
        return (
          <RechercheServicesCiviquesSecondary
            onCriteresChange={setCountCriteres}
            query={queryServiceCivique}
            onQueryUpdate={setQueryServiceCivique}
          />
        )
      default:
        return null
    }
  }
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
