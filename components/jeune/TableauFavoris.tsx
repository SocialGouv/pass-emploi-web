import React, { useState } from 'react'

import { OngletOffres } from 'components/favoris/offres/OngletOffres'
import { OngletRecherches } from 'components/favoris/recherches/OngletRecherches'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { Offre, Recherche } from 'interfaces/favoris'
import { Onglet } from 'pages/mes-jeunes/[jeune_id]/favoris'
import useMatomo from 'utils/analytics/useMatomo'

type TableauFavorisProps = {
  offres: Offre[]
  recherches: Recherche[]
  lectureSeule?: boolean
}

export enum Onglet {
  OFFRES = 'OFFRES',
  RECHERCHES = 'RECHERCHES',
}

export function TableauFavoris({
  offres,
  recherches,
  lectureSeule,
}: TableauFavorisProps) {
  const [currentTab, setCurrentTab] = useState<Onglet>(Onglet.OFFRES)
  const favorisTracking = `Détail jeune – Favoris${
    lectureSeule ? ' - hors portefeuille' : ''
  }`
  const recherchesTracking = `Détail jeune – Recherches${
    lectureSeule ? ' - hors portefeuille' : ''
  }`
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
          className='mt-8 pb-8'
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
