import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { FormEvent, useEffect, useMemo, useState } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import RadioButton from 'components/action/RadioButton'
import { OffreCard } from 'components/offres/OffreCard'
import Button from 'components/ui/Button/Button'
import { Etape } from 'components/ui/Form/Etape'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import IconComponent, { IconName } from 'components/ui/IconComponent'
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

  const debouncedLocalisationInput = useDebounce(localisationInput.value, 500)

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
        <Etape numero={1} titre='Sélectionner un type d’offre'>
          <RadioButton
            isSelected={true}
            onChange={() => {}}
            disabled={true}
            name='type-offre'
            id='type-offre--emploi'
            label='Offre d’emploi'
          />
        </Etape>

        <Etape numero={2} titre='Critères de recherche'>
          <Label htmlFor='mots-cles'>Mots clés (Métier, code ROME)</Label>
          <Input type='text' id='mots-cles' onChange={setMotsCles} />

          <Label htmlFor='localisation'>
            {{
              main: 'Lieu de travail',
              sub: 'Saisissez une ville ou un département',
            }}
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
        </Etape>

        <div className='flex justify-end mb-6'>
          <button
            type='button'
            onClick={() => setHasMoreFilters(!hasMoreFilters)}
            className='mr-12'
          >
            Voir plus de critères
          </button>
        </div>

        {hasMoreFilters && (
          <fieldset>
            <legend className='sr-only'>Étape 3 Plus de critères</legend>

            <div className='flex'>
              <fieldset className='grow flex flex-col gap-y-8'>
                <legend className='contents text-base-bold'>
                  Type de contrat
                </legend>

                <Checkbox
                  id='contrat--cdi'
                  label='CDI'
                  value=''
                  onChange={() => {}}
                />
                <Checkbox
                  id='contrat--cdd'
                  label='CDD - intérim - saisonnier'
                  value=''
                  onChange={() => {}}
                />
                <Checkbox
                  id='contrat--autres'
                  label='Autres'
                  value=''
                  onChange={() => {}}
                />
              </fieldset>

              <fieldset className='grow flex flex-col gap-y-8'>
                <legend className='contents text-base-bold'>
                  Temps de travail
                </legend>

                <Checkbox
                  id='temps-travail--plein'
                  label='Temps plein'
                  value=''
                  onChange={() => {}}
                />
                <Checkbox
                  id='temps-travail--partiel'
                  label='Temps partiel'
                  value=''
                  onChange={() => {}}
                />
              </fieldset>
            </div>
          </fieldset>
        )}

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

function Checkbox(props: {
  id: string
  value: string
  onChange: (value: string) => void
  label: string
}) {
  return (
    <label htmlFor={props.id} className='flex w-fit'>
      <input
        type='checkbox'
        value={props.value}
        id={props.id}
        className='h-6 w-6 mr-5'
        onChange={(e) => props.onChange(e.target.value)}
      />
      {props.label}
    </label>
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
