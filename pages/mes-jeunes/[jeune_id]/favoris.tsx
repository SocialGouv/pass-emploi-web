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
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { ApiError } from 'utils/httpClient'
import withDependance from 'utils/injectionDependances/withDependance'

interface FavorisProps extends PageProps {
  offres: Offre[]
  recherches: Recherche[]
}

export enum Onglet {
  OFFRES = 'OFFRES',
  RECHERCHES = 'RECHERCHES',
}

function Favoris({ offres, recherches }: FavorisProps) {
  const [currentTab, setCurrentTab] = useState<Onglet>(Onglet.OFFRES)
  const favorisTracking = 'Détail jeune – Favoris'
  const recherchesTracking = 'Détail jeune – Recherches'
  const [tracking, setTracking] = useState<string>(favorisTracking)

  async function switchTab(tab: Onglet) {
    setCurrentTab(tab)
    setTracking(tab === Onglet.OFFRES ? favorisTracking : recherchesTracking)
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
          className='mt-8 pb-8 border-b border-primary_lighten'
        >
          <OngletOffres offres={offres} />
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

  let offres: Offre[] = []
  let recherches: Recherche[] = []
  const {
    session: { accessToken },
  } = sessionOrRedirect
  const jeuneId = context.query.jeune_id
  if (!jeuneId) {
    return {
      props: { offres, recherches, pageTitle: 'Favoris' },
    }
  }
  const favorisService = withDependance<FavorisService>('favorisService')
  try {
    offres = await favorisService.getOffres(jeuneId as string, accessToken)
    recherches = await favorisService.getRecherches(
      jeuneId as string,
      accessToken
    )
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return { redirect: { destination: '/mes-jeunes', permanent: false } }
    }
    throw error
  }

  return {
    props: { offres, recherches, pageTitle: 'Favoris' },
  }
}

export default withTransaction(Favoris.name, 'page')(Favoris)
