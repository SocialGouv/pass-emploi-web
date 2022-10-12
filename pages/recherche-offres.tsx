import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { FormEvent, useEffect, useMemo, useState } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import RadioButton from 'components/action/RadioButton'
import { OffreCard } from 'components/offres/OffreCard'
import RechercheOffresEmploiMain from 'components/offres/RechercheOffresEmploiMain'
import RechercheOffresEmploiSecondary from 'components/offres/RechercheOffresEmploiSecondary'
import RechercheServiceCiviqueSecondary from 'components/offres/RechercheServicesCiviqueSecondary'
import RechercheServicesCiviquesMain from 'components/offres/RechercheServicesCiviquesMain'
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
import { Commune, Localite } from 'interfaces/referentiel'
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
import { useDebounce } from 'utils/hooks/useDebounce'
import { useDependance } from 'utils/injectionDependances'

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

  const [localites, setLocalites] = useState<Localite[]>([])
  const localitesOptions = useMemo(
    () => localites.map(({ code, libelle }) => ({ id: code, value: libelle })),
    [localites]
  )
  const [localisationInput, setLocalisationInput] = useState<{
    value?: string
    error?: string
  }>({})
  const debouncedLocalisationInput = useDebounce(localisationInput.value, 500)
  const [localite, setLocalite] = useState<Localite | undefined>()

  const [countCriteres, setCountCriteres] = useState<number>(0)
  const [queryOffresEmploi, setQueryOffresEmploi] =
    useState<SearchOffresEmploiQuery>({})
  const [queryServiceCivique, setQueryServiceCivique] =
    useState<SearchServicesCiviquesQuery>({})

  const RAYON_DEFAULT = 10

  const [offres, setOffres] = useState<BaseOffre[] | undefined>(undefined)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [searchError, setSearchError] = useState<string | undefined>()

  const pageTracking: string = 'Recherche offres emploi'
  let initialTracking: string = pageTracking
  if (partageSuccess) initialTracking += ' - Partage offre succès'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  const formIsValid = useMemo(
    () => !localisationInput.error,
    [localisationInput.error]
  )

  function handleLocalisationInputChanges(value: string) {
    setLocalisationInput({
      value: value.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    })
  }

  function validateLocalite(): boolean {
    if (!localisationInput.value) return true

    const localiteCorrespondante = findLocaliteInListe(
      localisationInput.value,
      localites
    )
    if (!localiteCorrespondante) {
      setLocalisationInput({
        ...localisationInput,
        error: 'Veuillez saisir une localisation correcte.',
      })
      return false
    } else {
      return true
    }
  }

  function findLocaliteInListe(
    value: string,
    liste: Localite[]
  ): Localite | undefined {
    return liste.find(
      ({ libelle }) =>
        libelle.localeCompare(value, undefined, {
          sensitivity: 'base',
        }) === 0
    )
  }

  async function rechercherOffres(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!typeOffre) return

    setIsSearching(true)
    setOffres(undefined)
    setSearchError(undefined)

    try {
      let result
      switch (typeOffre) {
        case TypeOffre.EMPLOI:
          if (!validateLocalite()) return
          result = await rechercherOffresEmploi()
          break
        case TypeOffre.SERVICE_CIVIQUE:
          if (!validateLocalite()) return
          result = await rechercherServicesCivique()
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
    const query: SearchOffresEmploiQuery = queryOffresEmploi

    if (localite?.type === 'DEPARTEMENT') query.departement = localite.code
    if (localite?.type === 'COMMUNE') query.commune = localite.code

    return await offresEmploiService.searchOffresEmploi(query)
  }

  async function rechercherServicesCivique(): Promise<BaseServiceCivique[]> {
    const query: SearchServicesCiviquesQuery = queryServiceCivique

    if (localite) {
      const { longitude, latitude } = localite as Commune
      query.coordonnees = { lat: latitude, lon: longitude }
    }

    return await servicesCiviquesService.searchServicesCiviques(query)
  }

  useEffect(() => {
    if (debouncedLocalisationInput) {
      let fetch: (query: string) => Promise<Localite[]>
      if (typeOffre === TypeOffre.EMPLOI) {
        fetch = referentielService.getCommunesEtDepartements
      } else {
        fetch = referentielService.getCommunes
      }

      fetch
        .bind(referentielService)(debouncedLocalisationInput)
        .then((communesEtDepartements) => {
          setLocalites(communesEtDepartements)
          if (communesEtDepartements.length) {
            setLocalite(
              findLocaliteInListe(
                debouncedLocalisationInput,
                communesEtDepartements
              )
            )
          }
        })
    } else {
      setLocalites([])
    }
  }, [debouncedLocalisationInput, referentielService, typeOffre])

  useEffect(() => {
    if (localite?.type === 'COMMUNE') {
      setQueryOffresEmploi((query) => ({ ...query, rayon: RAYON_DEFAULT }))
      setQueryServiceCivique((query) => ({ ...query, rayon: RAYON_DEFAULT }))
    } else {
      setQueryOffresEmploi(({ rayon, ...query }) => query)
    }
  }, [localite?.type])

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
              disabled={!formIsValid || isSearching}
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
            localitesOptions={localitesOptions}
            localisationInput={localisationInput}
            onLocalisationInputChange={handleLocalisationInputChanges}
            validateLocalite={validateLocalite}
            query={queryOffresEmploi}
            onQueryUpdate={setQueryOffresEmploi}
          />
        )
      case TypeOffre.SERVICE_CIVIQUE:
        return (
          <RechercheServicesCiviquesMain
            localitesOptions={localitesOptions}
            localisationInput={localisationInput}
            onLocalisationInputChange={handleLocalisationInputChanges}
            validateLocalite={validateLocalite}
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
          <RechercheServiceCiviqueSecondary
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
