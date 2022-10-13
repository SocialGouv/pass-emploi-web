import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { FormEvent, useState } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import RadioButton from 'components/action/RadioButton'
import { OffreCard } from 'components/offres/OffreCard'
import RechercheOffresEmploiMain from 'components/offres/RechercheOffresEmploiMain'
import RechercheOffresEmploiSecondary from 'components/offres/RechercheOffresEmploiSecondary'
import RechercheServicesCiviquesMain from 'components/offres/RechercheServicesCiviquesMain'
import RechercheServicesCiviquesSecondary from 'components/offres/RechercheServicesCiviquesSecondary'
import Button from 'components/ui/Button/Button'
import { Etape } from 'components/ui/Form/Etape'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import {
  BaseOffre,
  BaseOffreEmploi,
  BaseServiceCivique,
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
type RechercheOffresProps = PageProps & { partageSuccess?: boolean }

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

  const RAYON_DEFAULT = 10

  const [offres, setOffres] = useState<BaseOffre[] | undefined>(undefined)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [searchError, setSearchError] = useState<string | undefined>()

  const pageTracking: string = 'Recherche offres emploi'
  let initialTracking: string = pageTracking
  if (partageSuccess) initialTracking += ' - Partage offre succès'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  const formIsInvalid =
    queryOffresEmploi.hasError || queryServiceCivique.hasError

  async function rechercherOffres(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!typeOffre) return
    if (formIsInvalid) return

    setIsSearching(true)
    setOffres(undefined)
    setSearchError(undefined)

    try {
      let result
      switch (typeOffre) {
        case TypeOffre.EMPLOI:
          result = await rechercherOffresEmploi()
          break
        case TypeOffre.SERVICE_CIVIQUE:
          result = await rechercherServicesCiviques()
          break
      }
      setOffres(result)
      setTrackingTitle(pageTracking + ' - Résultats')
    } catch {
      setSearchError('Une erreur est survenue. Vous pouvez réessayer')
      setTrackingTitle(pageTracking + ' - Erreur')
    } finally {
      setIsSearching(false)
    }
  }

  async function rechercherOffresEmploi(): Promise<BaseOffreEmploi[]> {
    const { hasError, ...query } = queryOffresEmploi
    return offresEmploiService.searchOffresEmploi(query)
  }

  async function rechercherServicesCiviques(): Promise<BaseServiceCivique[]> {
    const { hasError, ...query } = queryServiceCivique
    return servicesCiviquesService.searchServicesCiviques(query)
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

      <form
        onSubmit={rechercherOffres}
        className={
          offres !== undefined
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

      {isSearching && (
        <h2 className='animate-pulse text-m-medium text-primary mb-5'>
          Liste des résultats
        </h2>
      )}

      {offres && offres.length > 0 && (
        <>
          <h2 id='result-title' className='text-m-medium text-primary mb-5'>
            Liste des résultats
          </h2>
          <ul aria-describedby='result-title'>
            {offres!.map((offre) => (
              <li key={offre.id} className='mb-4'>
                {offre.type === TypeOffre.EMPLOI && (
                  <OffreCard offre={offre} withPartage={true} />
                )}
                {offre.type === TypeOffre.SERVICE_CIVIQUE && (
                  <div>
                    <h3>Offre n°{offre.id}</h3>
                    <p>{offre.titre}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {offres && offres.length === 0 && (
        <>
          <h2 id='result-title' className='text-m-medium text-primary mb-5'>
            Liste des résultats
          </h2>
          <EmptyStateImage
            focusable='false'
            aria-hidden='true'
            className='m-auto w-[200px] h-[200px]'
          />
          <p className='text-base-bold text-center'>
            Aucune offre ne correspond à vos critères de recherche.
          </p>
        </>
      )}
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
