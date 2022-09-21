import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { FormEvent, useState } from 'react'

import Button from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { OffreEmploi } from 'interfaces/offre-emploi'
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
  const [offres, setOffres] = useState<OffreEmploi[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [searchError, setSearchError] = useState<string | undefined>()

  const initialTracking: string = 'Recherche offres emploi'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  async function rechercherOffresEmploi(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setIsSearching(true)
    setOffres([])
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
      <form onSubmit={rechercherOffresEmploi} className='flex items-center'>
        <div className='grow'>
          <Label htmlFor='mots-cles'>
            Mots clés (intitulé, numéro d’offre, code ROME)
          </Label>
          <Input type='text' id='mots-cles' onChange={setMotsCles} />
        </div>

        <Button type='submit' className='ml-5' isLoading={isSearching}>
          Rechercher
        </Button>
      </form>

      {isSearching && (
        <h2
          id='result-title'
          className='animate-pulse text-m-medium text-primary mb-5'
        >
          Liste des résultats
        </h2>
      )}
      {searchError && (
        <FailureAlert
          label={searchError}
          onAcknowledge={() => setSearchError(undefined)}
        />
      )}
      {offres.length > 0 && (
        <>
          <h2 id='result-title' className='text-m-medium text-primary mb-5'>
            Liste des résultats
          </h2>
          <ul aria-describedby='result-title'>
            {offres.map((offre) => (
              <li key={offre.id}>{offre.titre}</li>
            ))}
          </ul>
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
