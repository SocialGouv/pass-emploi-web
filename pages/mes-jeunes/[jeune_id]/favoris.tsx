import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'

import { OngletOffres } from 'components/favoris/offres/OngletOffres'
import { OngletRecherches } from 'components/favoris/recherches/OngletRecherches'
import Tab from 'components/ui/Tab'
import TabList from 'components/ui/TabList'
import { PageProps } from 'interfaces/pageProps'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

interface FavorisProps extends PageProps {
  offres: []
  recherches: []
}

export enum Onglet {
  FAVORIS = 'FAVORIS',
  RECHERCHES = 'RECHERCHES',
}

function Favoris() {
  const [currentTab, setCurrentTab] = useState<Onglet>(Onglet.FAVORIS)

  async function switchTab(tab: Onglet) {
    setCurrentTab(tab)
  }

  return (
    <>
      <TabList className='mt-10'>
        <Tab
          label='Favoris'
          count={0}
          selected={currentTab === Onglet.FAVORIS}
          controls='liste-favoris'
          onSelectTab={() => switchTab(Onglet.FAVORIS)}
        />
        <Tab
          label='Recherches'
          count={0}
          selected={currentTab === Onglet.RECHERCHES}
          controls='liste-recherches'
          onSelectTab={() => switchTab(Onglet.RECHERCHES)}
        />
      </TabList>

      {currentTab === Onglet.FAVORIS && (
        <div
          role='tabpanel'
          aria-labelledby='liste-favoris--tab'
          tabIndex={0}
          id='liste-favoris'
          className='mt-8 pb-8 border-b border-primary_lighten'
        >
          <OngletOffres offres={[]} />
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
          <OngletRecherches recherches={[]} />
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
    session: { user, accessToken },
  } = sessionOrRedirect
  const favorisService = withDependance<FavorisService>('favorisService')
  const offres = await favorisService.getOffres(user.id, accessToken)
  const recherches = await favorisService.getRecherches(user.id, accessToken)

  return {
    offres,
    recherches,
    pageTitle: 'Favoris',
  }
}

export default withTransaction(Favoris.name, 'page')(Favoris)
