import React, { useState } from 'react'

import { OngletFavoris } from '../../../components/favoris/OngletFavoris'
import Tab from '../../../components/ui/Tab'
import TabList from '../../../components/ui/TabList'

export enum Onglet {
  FAVORIS = 'FAVORIS',
  RECHERCHES = 'RECHERCHES',
}

export default function Favoris() {
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
          <OngletFavoris offres={[]} />
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
          <OngletFavoris offres={[]} />
        </div>
      )}
    </>
  )
}
