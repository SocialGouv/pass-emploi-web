import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import React, { FormEvent, useState } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import Button from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { BaseOffreEmploi } from 'interfaces/offre-emploi'
import { PageProps } from 'interfaces/pageProps'
import { OffresEmploiService } from 'services/offres-emploi.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'

type RechercheOffresProps = PageProps

function RechercheOffres() {
  const offresEmploiService = useDependance<OffresEmploiService>(
    'offresEmploiService'
  )

  const [motsCles, setMotsCles] = useState<string | undefined>()
  const [offres, setOffres] = useState<BaseOffreEmploi[] | undefined>(undefined)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [searchError, setSearchError] = useState<string | undefined>()

  const initialTracking: string = 'Recherche offres emploi'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  async function rechercherOffresEmploi(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setIsSearching(true)
    setOffres(undefined)
    setSearchError(undefined)
    try {
      const result = await offresEmploiService.searchOffresEmploi(
        motsCles ? { motsCles } : {}
      )
      setOffres(result)
      setTrackingTitle(initialTracking + ' - Résultats')
    } catch {
      setSearchError('Une erreur est survenue. Vous pouvez réessayer')
      setTrackingTitle(initialTracking + ' - Erreur')
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

      <form onSubmit={rechercherOffresEmploi} className='flex items-center'>
        <div className='grow'>
          <Label htmlFor='mots-cles'>Mots clés (intitulé, code ROME)</Label>
          <Input type='text' id='mots-cles' onChange={setMotsCles} />
        </div>

        <Button type='submit' className='ml-5' disabled={isSearching}>
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
              <li key={offre.id} className='flex items-center'>
                <Link href={`/offres/${offre.id}/partage`}>
                  <a aria-label={`Partager offre numéro ${offre.id}`}>
                    <IconComponent
                      name={IconName.Partage}
                      className='w-4 h-4 fill-primary'
                      focusable={false}
                      aria-hidden={true}
                    />
                  </a>
                </Link>
                {offre.titre}
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

  return {
    props: {
      pageTitle: 'Recherche d’offres',
      pageHeader: 'Offres',
    },
  }
}

export default withTransaction(RechercheOffres.name, 'page')(RechercheOffres)
