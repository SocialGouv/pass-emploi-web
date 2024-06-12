import React, { useState } from 'react'

import { OngletOffres } from 'components/favoris/offres/OngletOffres'
import { OngletRecherches } from 'components/favoris/recherches/OngletRecherches'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { Offre, Recherche } from 'interfaces/favoris'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

type TabFavorisProps = {
  offres: Offre[]
  recherches: Recherche[]
  lectureSeule?: boolean
}

export enum OngletFavoris {
  OFFRES = 'OFFRES',
  RECHERCHES = 'RECHERCHES',
}

export function TabFavoris({
  offres,
  recherches,
  lectureSeule,
}: TabFavorisProps) {
  const [portefeuille] = usePortefeuille()

  const [currentTab, setCurrentTab] = useState<OngletFavoris>(
    OngletFavoris.OFFRES
  )
  const favorisTracking = `Détail jeune – Favoris${
    lectureSeule ? ' - hors portefeuille' : ''
  }`
  const recherchesTracking = `Détail jeune – Recherches${
    lectureSeule ? ' - hors portefeuille' : ''
  }`
  const [tracking, setTracking] = useState<string>(favorisTracking)

  async function switchTab(tab: OngletFavoris) {
    setCurrentTab(tab)
    setTracking(
      tab === OngletFavoris.OFFRES ? favorisTracking : recherchesTracking
    )
  }

  useMatomo(tracking, portefeuille.length > 0)

  return (
    <>
      <TabList className='mt-10'>
        <Tab
          label='Offres'
          count={offres.length}
          selected={currentTab === OngletFavoris.OFFRES}
          controls='liste-offres'
          onSelectTab={() => switchTab(OngletFavoris.OFFRES)}
        />
        <Tab
          label='Recherches'
          count={recherches.length}
          selected={currentTab === OngletFavoris.RECHERCHES}
          controls='liste-recherches'
          onSelectTab={() => switchTab(OngletFavoris.RECHERCHES)}
        />
      </TabList>
      {currentTab === OngletFavoris.OFFRES && (
        <div
          role='tabpanel'
          aria-labelledby='liste-offres--tab'
          tabIndex={0}
          id='liste-offres'
          className='mt-8 pb-8'
        >
          <OngletOffres offres={offres} />
        </div>
      )}
      {currentTab === OngletFavoris.RECHERCHES && (
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
