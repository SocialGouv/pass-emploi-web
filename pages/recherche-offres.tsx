import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { FormEvent, useMemo, useState } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import { OffreCard } from 'components/offres/OffreCard'
import Button from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { desLocalites } from 'fixtures/referentiel'
import { OffreEmploiItem } from 'interfaces/offre-emploi'
import { PageProps } from 'interfaces/pageProps'
import { Localite } from 'interfaces/referentiel'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import {
  OffresEmploiService,
  SearchOffresEmploiQuery,
} from 'services/offres-emploi.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'

type RechercheOffresProps = PageProps & { partageSuccess?: boolean }

function RechercheOffres({ partageSuccess }: RechercheOffresProps) {
  const offresEmploiService = useDependance<OffresEmploiService>(
    'offresEmploiService'
  )

  const [localites] = useState<Localite[]>(desLocalites)

  const [motsCles, setMotsCles] = useState<string | undefined>()
  const [localisation, setLocalisation] = useState<{
    value?: string
    error?: string
  }>({})
  const [localite, setLocalite] = useState<Localite | undefined>()

  const [offres, setOffres] = useState<OffreEmploiItem[] | undefined>(undefined)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [searchError, setSearchError] = useState<string | undefined>()

  const pageTracking: string = 'Recherche offres emploi'
  let initialTracking: string = pageTracking
  if (partageSuccess) initialTracking += ' - Partage offre succès'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  const formIsValid = useMemo(() => !localisation.error, [localisation.error])

  function validateLocalite() {
    if (!localisation.value) return

    const localiteCorrespondante: Localite | undefined = localites.find(
      ({ libelle }) =>
        libelle.localeCompare(localisation.value!, undefined, {
          sensitivity: 'base',
        }) === 0
    )

    if (!localiteCorrespondante) {
      setLocalisation({
        ...localisation,
        error: 'Veuillez saisir une localisation correcte.',
      })
    } else {
      setLocalite(localiteCorrespondante)
    }
  }

  async function rechercherOffresEmploi(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!formIsValid) return

    setIsSearching(true)
    setOffres(undefined)
    setSearchError(undefined)
    try {
      const query: SearchOffresEmploiQuery = {}
      if (motsCles) query.motsCles = motsCles

      if (localite) {
        if (localite.type === 'DEPARTEMENT') query.departement = localite.code
        if (localite.type === 'COMMUNE') query.commune = localite.code
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
        <div className='w-1/2'>
          <Label htmlFor='localisation'>
            Localisation (département ou commune)
          </Label>
          {localisation.error && (
            <InputError id='localisation--error'>
              {localisation.error}
            </InputError>
          )}
          <SelectAutocomplete
            id='localisation'
            options={localites.map((localite) => ({
              id: localite.code,
              value: localite.libelle,
            }))}
            onChange={(value) => setLocalisation({ value })}
            onBlur={validateLocalite}
            invalid={Boolean(localisation.error)}
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
              <OffreCard key={offre.id} offre={offre} />
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
