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
import { Switch } from 'components/ui/Form/Switch'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { BaseOffre, TypeOffre } from 'interfaces/offre'
import { PageProps } from 'interfaces/pageProps'
import { Commune, Localite } from 'interfaces/referentiel'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import {
  Duree,
  OffresEmploiService,
  SearchOffresEmploiQuery,
  TypeContrat,
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
  const [localites, setLocalites] = useState<Localite[]>([])
  const [hasMoreFilters, setHasMoreFilters] = useState<boolean>(false)
  const [afficherRayon, setAfficherRayon] = useState<boolean>(false)

  const [motsCles, setMotsCles] = useState<string | undefined>()
  const [localisationInput, setLocalisationInput] = useState<{
    value?: string
    error?: string
  }>({})
  const debouncedLocalisationInput = useDebounce(localisationInput.value, 500)
  const [localiteSaisie, setLocaliteSaisie] = useState<Localite | undefined>()
  const [isDebutantAccepte, setIsDebutantAccepte] = useState<boolean>(false)
  const [typesContrats, setTypesContrats] = useState<TypeContrat[]>([])
  const [durees, setDurees] = useState<Duree[]>([])
  const [rayon, setRayon] = useState<number | undefined>()
  const RAYON_DEFAULT = 10
  const RAYON_MIN = 0
  const RAYON_MAX = 100
  const [countCriteres, setCountCriteres] = useState<number>(0)

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

  const localiteOptions = useMemo(
    () => localites.map(({ code, libelle }) => ({ id: code, value: libelle })),
    [localites]
  )

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

  function handleLocalisationInputChanges(value: string) {
    setLocalisationInput({
      value: value?.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    })
  }

  function updateTypeContrat(type: TypeContrat) {
    const index = typesContrats.indexOf(type)
    if (index > -1) {
      const modified = [...typesContrats]
      modified.splice(index, 1)
      setTypesContrats(modified)
    } else {
      setTypesContrats(typesContrats.concat(type))
    }
  }

  function updateDuree(duree: Duree) {
    const index = durees.indexOf(duree)
    if (index > -1) {
      const modified = [...durees]
      modified.splice(index, 1)
      setDurees(modified)
    } else {
      setDurees(durees.concat(duree))
    }
  }

  async function rechercherOffres(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!typeOffre) return

    switch (typeOffre) {
      case TypeOffre.EMPLOI:
        if (!validateLocalite()) return

        setIsSearching(true)
        setOffres(undefined)
        setSearchError(undefined)
        try {
          const query: SearchOffresEmploiQuery = {}

          if (localiteSaisie) {
            if (localiteSaisie.type === 'DEPARTEMENT')
              query.departement = localiteSaisie.code
            if (localiteSaisie.type === 'COMMUNE')
              query.commune = localiteSaisie.code
          }

          if (rayon !== undefined) query.rayon = rayon
          if (motsCles) query.motsCles = motsCles
          if (isDebutantAccepte) query.debutantAccepte = true
          if (typesContrats.length) query.typesContrats = typesContrats
          if (durees.length) query.durees = durees

          const result = await offresEmploiService.searchOffresEmploi(query)
          setOffres(result)
          setTrackingTitle(pageTracking + ' - Résultats')
        } catch {
          setSearchError('Une erreur est survenue. Vous pouvez réessayer')
          setTrackingTitle(pageTracking + ' - Erreur')
        } finally {
          setIsSearching(false)
        }
        break
      case TypeOffre.SERVICE_CIVIQUE:
        if (!validateLocalite()) return

        setIsSearching(true)
        setOffres(undefined)
        setSearchError(undefined)
        try {
          const query: SearchServicesCiviquesQuery = {}

          if (localiteSaisie) {
            const { longitude, latitude } = localiteSaisie as Commune
            query.coordonnees = { lat: latitude, lon: longitude }
          }

          const result = await servicesCiviquesService.searchServicesCiviques(
            query
          )
          console.log({ result })
          setOffres(result)
          setTrackingTitle(pageTracking + ' - Résultats')
        } catch (e) {
          console.log({ e })
          setSearchError('Une erreur est survenue. Vous pouvez réessayer')
          setTrackingTitle(pageTracking + ' - Erreur')
        } finally {
          setIsSearching(false)
        }
        break
    }
  }

  useEffect(() => {
    if (debouncedLocalisationInput) {
      let fetch: (query: string) => Promise<Localite[]>
      if (typeOffre === TypeOffre.EMPLOI) {
        fetch = referentielService.getCommunesEtDepartements
      } else {
        fetch = referentielService.getCommunes
      }

      fetch(debouncedLocalisationInput).then((communesEtDepartements) => {
        setLocalites(communesEtDepartements)
        if (communesEtDepartements.length) {
          setLocaliteSaisie(
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
    if (localiteSaisie?.type === 'COMMUNE') {
      setAfficherRayon(true)
      setRayon(RAYON_DEFAULT)
    } else {
      setAfficherRayon(false)
      setRayon(undefined)
    }
  }, [localiteSaisie?.type])

  useEffect(() => {
    let nbCriteres = 0
    if (typesContrats.length > 0) nbCriteres++
    if (durees.length > 0) nbCriteres++
    if (isDebutantAccepte) nbCriteres++
    if (rayon !== undefined) nbCriteres++
    setCountCriteres(nbCriteres)
  }, [durees.length, isDebutantAccepte, rayon, typesContrats.length])

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

        {typeOffre === TypeOffre.EMPLOI && (
          <>
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
                Voir {hasMoreFilters ? 'moins' : 'plus'} de critères
                <IconComponent
                  name={
                    hasMoreFilters ? IconName.ChevronUp : IconName.ChevronDown
                  }
                  className='h-4 w-4 fill-primary inline ml-2'
                  aria-hidden={true}
                  focusable={false}
                ></IconComponent>
              </button>
            </div>

            {hasMoreFilters && (
              <fieldset>
                <legend className='sr-only'>Étape 3 Plus de critères</legend>

                <div className='flex mb-10'>
                  <fieldset className='grow flex flex-col gap-y-8'>
                    <legend className='contents text-base-bold'>
                      Type de contrat
                    </legend>

                    <Checkbox
                      id='contrat--cdi'
                      label='CDI'
                      value='CDI'
                      checked={typesContrats.includes('CDI')}
                      onChange={(value) =>
                        updateTypeContrat(value as TypeContrat)
                      }
                    />
                    <Checkbox
                      id='contrat--cdd'
                      label='CDD - intérim - saisonnier'
                      value='CDD-interim-saisonnier'
                      checked={typesContrats.includes('CDD-interim-saisonnier')}
                      onChange={(value) =>
                        updateTypeContrat(value as TypeContrat)
                      }
                    />
                    <Checkbox
                      id='contrat--autres'
                      label='Autres'
                      value='autre'
                      checked={typesContrats.includes('autre')}
                      onChange={(value) =>
                        updateTypeContrat(value as TypeContrat)
                      }
                    />
                  </fieldset>

                  <fieldset className='grow flex flex-col gap-y-8'>
                    <legend className='contents text-base-bold'>
                      Temps de travail
                    </legend>

                    <Checkbox
                      id='temps-travail--plein'
                      label='Temps plein'
                      value='Temps plein'
                      checked={durees.includes('Temps plein')}
                      onChange={(value) => updateDuree(value as Duree)}
                    />
                    <Checkbox
                      id='temps-travail--partiel'
                      label='Temps partiel'
                      value='Temps partiel'
                      checked={durees.includes('Temps partiel')}
                      onChange={(value) => updateDuree(value as Duree)}
                    />
                  </fieldset>
                </div>

                <fieldset>
                  <legend className='text-base-bold mb-6'>Expérience</legend>
                  <label
                    htmlFor='debutants-acceptes'
                    className='flex items-center'
                  >
                    <Switch
                      id='debutants-acceptes'
                      checked={isDebutantAccepte}
                      onChange={() => setIsDebutantAccepte(!isDebutantAccepte)}
                    />
                    <span className='ml-8'>
                      Afficher uniquement les offres débutant accepté
                    </span>
                  </label>
                </fieldset>

                {afficherRayon && (
                  <fieldset className='mt-8 w-1/2 min-w-[300px]'>
                    <legend className='text-base-bold mb-4'>Distance</legend>
                    <label htmlFor='distance'>
                      Dans un rayon de :{' '}
                      <span className='text-base-bold'>{rayon}km</span>
                    </label>
                    <Input
                      id='distance'
                      type='range'
                      className='block mt-4 w-full'
                      value={rayon}
                      min={RAYON_MIN}
                      max={RAYON_MAX}
                      onChange={(value: string) =>
                        setRayon(parseInt(value, 10))
                      }
                      list='distance-bornes'
                    />
                    <datalist
                      id='distance-bornes'
                      className='flex justify-between'
                    >
                      <option value='0' label='0km' className='text-s-bold' />
                      <option
                        value='100'
                        label='100km'
                        className='text-s-bold'
                      />
                    </datalist>
                  </fieldset>
                )}
              </fieldset>
            )}
          </>
        )}

        {typeOffre === TypeOffre.SERVICE_CIVIQUE && (
          <>
            <Etape numero={2} titre='Critères de recherche'>
              <Label htmlFor='localisation'>
                {{
                  main: 'Localisation',
                  sub: 'Saisissez une ville',
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
          </>
        )}

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
                  <span>
                    Offre {offre.id} : {offre.titre}
                  </span>
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
}

function Checkbox(props: {
  id: string
  value: string
  onChange: (value: string) => void
  label: string
  checked: boolean
}) {
  return (
    <label htmlFor={props.id} className='flex w-fit'>
      <input
        type='checkbox'
        value={props.value}
        id={props.id}
        checked={props.checked}
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
