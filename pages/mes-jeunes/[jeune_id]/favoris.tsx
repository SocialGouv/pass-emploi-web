import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'

import { Offre, Recherche } from '../../../interfaces/favoris'
import { FavorisService } from '../../../services/favoris.service'

import { OngletOffres } from 'components/favoris/offres/OngletOffres'
import { OngletRecherches } from 'components/favoris/recherches/OngletRecherches'
import Tab from 'components/ui/Tab'
import TabList from 'components/ui/TabList'
import { PageProps } from 'interfaces/pageProps'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

interface FavorisProps extends PageProps {
  offres: Offre[]
  recherches: Recherche[]
}

export enum Onglet {
  FAVORIS = 'FAVORIS',
  RECHERCHES = 'RECHERCHES',
}

function Favoris({ offres, recherches }: FavorisProps) {
  const [currentTab, setCurrentTab] = useState<Onglet>(Onglet.FAVORIS)

  async function switchTab(tab: Onglet) {
    setCurrentTab(tab)
  }

  return (
    <>
      <TabList className='mt-10'>
        <Tab
          label='Favoris'
          count={offres.length}
          selected={currentTab === Onglet.FAVORIS}
          controls='liste-favoris'
          onSelectTab={() => switchTab(Onglet.FAVORIS)}
        />
        <Tab
          label='Recherches'
          count={recherches.length}
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

  // TODO gerer 403
  const {
    session: { accessToken },
  } = sessionOrRedirect
  const jeuneId = context.query.jeune_id
  console.log('------------------------------')
  console.log(jeuneId)
  if (!jeuneId) {
    return {
      props: { offres: [], recherches: [], pageTitle: 'Favoris' },
    }
  }
  console.log('after if')
  const favorisService = withDependance<FavorisService>('favorisService')
  const offres = await favorisService.getOffres(jeuneId as string, accessToken)
  const recherches = await favorisService.getRecherches(
    jeuneId as string,
    accessToken
  )

  return {
    props: { offres, recherches, pageTitle: 'Favoris' },
  }
}

export default withTransaction(Favoris.name, 'page')(Favoris)
