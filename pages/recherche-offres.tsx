import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { FormEvent, useEffect, useMemo, useState } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import { OffreCard } from 'components/offres/OffreCard'
import Button from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { BaseOffreEmploi } from 'interfaces/offre-emploi'
import { PageProps } from 'interfaces/pageProps'
import { Localite } from 'interfaces/referentiel'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import {
  OffresEmploiService,
  SearchOffresEmploiQuery,
} from 'services/offres-emploi.service'
import { ReferentielService } from 'services/referentiel.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDebounce } from 'utils/hooks/useDebounce'
import { useDependance } from 'utils/injectionDependances'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import RadioButton from 'components/action/RadioButton'
import propsStatutsActions from 'components/action/propsStatutsActions'

type RechercheOffresProps = PageProps & { partageSuccess?: boolean }

function RechercheOffres({ partageSuccess }: RechercheOffresProps) {
  const offresEmploiService = useDependance<OffresEmploiService>(
    'offresEmploiService'
  )

  const referentielService =
    useDependance<ReferentielService>('referentielService')

  const [localites, setLocalites] = useState<Localite[]>([])

  const [motsCles, setMotsCles] = useState<string | undefined>()
  const [localisationInput, setLocalisationInput] = useState<{
    value?: string
    error?: string
  }>({})

  const debouncedLocalisationInput = useDebounce(localisationInput.value, 1000)

  const [offres, setOffres] = useState<BaseOffreEmploi[] | undefined>(undefined)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [searchError, setSearchError] = useState<string | undefined>()
  const [hasMoreFilters, setHasMoreFilters] = useState<boolean>(false)

  const pageTracking: string = 'Recherche offres emploi'
  let initialTracking: string = pageTracking
  if (partageSuccess) initialTracking += ' - Partage offre succès'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  const formIsValid = useMemo(
    () => !localisationInput.error,
    [localisationInput.error]
  )

  const localiteOptions = useMemo(
    () => localites.map(({ code, libelle }) => ({ id: code, value: libelle })),
    [localites]
  )

  function validateLocalite(): Localite | null | false {
    if (!localisationInput.value) return null

    const localiteCorrespondante: Localite | undefined = localites.find(
      ({ libelle }) =>
        libelle.localeCompare(localisationInput.value!, undefined, {
          sensitivity: 'base',
        }) === 0
    )

    if (!localiteCorrespondante) {
      setLocalisationInput({
        ...localisationInput,
        error: 'Veuillez saisir une localisation correcte.',
      })
      return false
    } else {
      return localiteCorrespondante
    }
  }

  function handleLocalisationInputChanges(value: string) {
    setLocalisationInput({
      value: value?.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    })
  }

  async function rechercherOffresEmploi(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const localiteValide = validateLocalite()
    if (localiteValide === false) return

    setIsSearching(true)
    setOffres(undefined)
    setSearchError(undefined)
    try {
      const query: SearchOffresEmploiQuery = {}
      if (motsCles) query.motsCles = motsCles

      if (localiteValide) {
        if (localiteValide.type === 'DEPARTEMENT')
          query.departement = localiteValide.code
        if (localiteValide.type === 'COMMUNE')
          query.commune = localiteValide.code
      }

      const result = await offresEmploiService.searchOffresEmploi(query)
      setOffres(result)
      setTrackingTitle(pageTracking + ' - Résultats')
    } catch {
      setSearchError('Une erreur est survenue. Vous pouvez réessayer')
      setTrackingTitle(pageTracking + ' - Erreur')
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    if (debouncedLocalisationInput) {
      referentielService
        .getCommunesEtDepartements(debouncedLocalisationInput)
        .then(setLocalites)
    } else {
      setLocalites([])
    }
  }, [debouncedLocalisationInput, referentielService])

  useMatomo(trackingTitle)

  return (
    <>
      {searchError && (
        <FailureAlert
          label={searchError}
          onAcknowledge={() => setSearchError(undefined)}
        />
      )}

      <form onSubmit={rechercherOffresEmploi}>
        <div>
          <legend
            className='flex items-center text-m-bold mb-4'
            aria-label='Selectionner un type d’offre'
          >
            <IconComponent
              name={IconName.Chiffre1}
              role='img'
              focusable={false}
              className='mr-2 w-8 h-8'
            />
            Selectionner un type d’offre
          </legend>
          <div className='mb-4'>
            <RadioButton
              isSelected={true}
              onChange={() => {}}
              name='type-offre'
              id='type-offre-emploi'
              label='Offre d’emploi'
            />
          </div>
        </div>

        <div className='w-1/2'>
          <legend className='flex items-center text-m-bold mb-8'>
            <IconComponent
              name={IconName.Chiffre2}
              role='img'
              focusable={false}
              className='mr-2 w-8 h-8'
            />
            Critères de recherche
          </legend>
          <Label htmlFor='localisation'>
            Localisation (département ou commune)
          </Label>
          {localisationInput.error && (
            <InputError id='localisation--error'>
              {localisationInput.error}
            </InputError>
          )}
          <SelectAutocomplete
            id='localisation'
            options={localiteOptions}
            onChange={handleLocalisationInputChanges}
            onBlur={validateLocalite}
            invalid={Boolean(localisationInput.error)}
            value={localisationInput.value ?? ''}
          />
        </div>

        <div className='flex items-center'>
          <div className='grow'>
            <Label htmlFor='mots-cles'>Mots clés (intitulé, code ROME)</Label>
            <Input type='text' id='mots-cles' onChange={setMotsCles} />
          </div>

          <Button
            type='submit'
            className='ml-5'
            disabled={!formIsValid || isSearching}
          >
            Rechercher
          </Button>
        </div>

        <div>
          <button
            type='button'
            onClick={() => setHasMoreFilters(!hasMoreFilters)}
          >
            Voir plus de critères
          </button>
          {hasMoreFilters && (
            <div>
              <div>
                <p className='my-4'>Type de contrat</p>
                <label key='' htmlFor='' className='flex pb-4'>
                  <input
                    type='checkbox'
                    value=''
                    id=''
                    className='h-5 w-5'
                    checked={false}
                    onChange={() => {}}
                  />
                  <span className='pl-5'>CDI</span>
                </label>
                <label key='' htmlFor='' className='flex pb-4'>
                  <input
                    type='checkbox'
                    value=''
                    id=''
                    className='h-5 w-5'
                    checked={false}
                    onChange={() => {}}
                  />
                  <span className='pl-5'>CDD - intérim - saisonnier</span>
                </label>
                <label key='' htmlFor='' className='flex pb-4'>
                  <input
                    type='checkbox'
                    value=''
                    id=''
                    className='h-5 w-5'
                    checked={false}
                    onChange={() => {}}
                  />
                  <span className='pl-5'>Autres</span>
                </label>
              </div>
            </div>
          )}
        </div>
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
                <OffreCard offre={offre} withPartage={true} />
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
