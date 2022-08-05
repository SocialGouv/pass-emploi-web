import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'

import { OngletOffres } from 'components/favoris/offres/OngletOffres'
import { OngletRecherches } from 'components/favoris/recherches/OngletRecherches'
import Tab from 'components/ui/Tab'
import TabList from 'components/ui/TabList'
import { Offre, Recherche } from 'interfaces/favoris'
import { PageProps } from 'interfaces/pageProps'
import { FavorisService } from 'services/favoris.service'
import { OffresEmploiService } from 'services/offres.service'
import { ServicesCiviqueService } from 'services/services-civique.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { ApiError } from 'utils/httpClient'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

interface FavorisProps extends PageProps {
  offres: Offre[]
  recherches: Recherche[]
}

export enum Onglet {
  OFFRES = 'OFFRES',
  RECHERCHES = 'RECHERCHES',
}

export const TYPES_TO_REDIRECT_PE = ['OFFRE_ALTERNANCE', 'OFFRE_EMPLOI']
export const TYPES_TO_REDIRECT_SERVICE_CIVIQUE = ['OFFRE_SERVICE_CIVIQUE']

function Favoris({ offres, recherches }: FavorisProps) {
  const offresEmploiService = useDependance<OffresEmploiService>(
    'offresEmploiService'
  )
  const servicesCiviqueService = useDependance<ServicesCiviqueService>(
    'servicesCiviqueService'
  )

  const [currentTab, setCurrentTab] = useState<Onglet>(Onglet.OFFRES)
  const favorisTracking = 'Détail jeune – Favoris'
  const recherchesTracking = 'Détail jeune – Recherches'
  const [tracking, setTracking] = useState<string>(favorisTracking)

  async function switchTab(tab: Onglet) {
    setCurrentTab(tab)
    setTracking(tab === Onglet.OFFRES ? favorisTracking : recherchesTracking)
  }

  //TODO Gerer les 404
  async function handleRedirectionOffre(idOffre: string, type: string) {
    console.log(idOffre)
    console.log(type)
    if (TYPES_TO_REDIRECT_PE.includes(type)) {
      console.log('pe')
      const offreEmploiRedirectionUrl =
        await offresEmploiService.getOffreEmploiClient(idOffre)
      //window.location.href = offreEmploiRedirectionUrl
      console.log(offreEmploiRedirectionUrl)
      window.open(
        offreEmploiRedirectionUrl,
        '_blank' // <- This is what makes it open in a new window.
      )
    } else if (TYPES_TO_REDIRECT_SERVICE_CIVIQUE.includes(type)) {
      console.log('service civique')
      const serviceEngagementRedirectionUrl =
        await servicesCiviqueService.getServiceCiviqueClient(idOffre)
      //window.location.href = servicesCiviqueService
      console.log(serviceEngagementRedirectionUrl)
      window.open(
        serviceEngagementRedirectionUrl,
        '_blank' // <- This is what makes it open in a new window.
      )
    } else {
      console.log('bye bye')
    }
  }

  useMatomo(tracking)

  return (
    <>
      <TabList className='mt-10'>
        <Tab
          label='Offres'
          count={offres.length}
          selected={currentTab === Onglet.OFFRES}
          controls='liste-offres'
          onSelectTab={() => switchTab(Onglet.OFFRES)}
        />
        <Tab
          label='Recherches'
          count={recherches.length}
          selected={currentTab === Onglet.RECHERCHES}
          controls='liste-recherches'
          onSelectTab={() => switchTab(Onglet.RECHERCHES)}
        />
      </TabList>

      {currentTab === Onglet.OFFRES && (
        <div
          role='tabpanel'
          aria-labelledby='liste-offres--tab'
          tabIndex={0}
          id='liste-offres'
          className='mt-8 pb-8'
        >
          <OngletOffres
            offres={offres}
            handleRedirectionOffre={handleRedirectionOffre}
          />
        </div>
      )}
      {currentTab === Onglet.RECHERCHES && (
        <div
          role='tabpanel'
          aria-labelledby='liste-recherches--tab'
          tabIndex={0}
          id='liste-recherches'
          className='mt-8 pb-8'
        >
          <OngletRecherches recherches={recherches} />
        </div>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<FavorisProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }
  const {
    session: { accessToken },
  } = sessionOrRedirect

  const favorisService = withDependance<FavorisService>('favorisService')

  const jeuneId = context.query.jeune_id as string

  try {
    const offres = await favorisService.getOffres(jeuneId, accessToken)
    const recherches = await favorisService.getRecherchesSauvegardees(
      jeuneId,
      accessToken
    )
    return {
      props: { offres, recherches, pageTitle: 'Favoris' },
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return { redirect: { destination: '/mes-jeunes', permanent: false } }
    }
    throw error
  }
}

export default withTransaction(Favoris.name, 'page')(Favoris)
