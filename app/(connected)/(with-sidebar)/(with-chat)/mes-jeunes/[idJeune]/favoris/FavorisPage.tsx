'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React, { useState } from 'react'

import TableauOffres from 'components/favoris/offres/TableauOffres'
import TableauRecherches from 'components/favoris/recherches/TableauRecherches'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import { Offre, Recherche } from 'interfaces/favoris'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

export enum OngletFavoris {
  OFFRES = 'OFFRES',
  RECHERCHES = 'RECHERCHES',
}

type FavorisProps = {
  beneficiaire: BaseBeneficiaire
  lectureSeule: boolean
  offres: Offre[]
  recherches: Recherche[]
}

function FavorisPage({
  beneficiaire,
  offres,
  recherches,
  lectureSeule,
}: FavorisProps) {
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
      <TabList
        label={`Offres et recherches mises en favoris par ${beneficiaire.prenom} ${beneficiaire.nom}`}
        className='mt-10'
      >
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
          <TableauOffres offres={offres} />
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
          <TableauRecherches recherches={recherches} />
        </div>
      )}
    </>
  )
}

export default withTransaction(FavorisPage.name, 'page')(FavorisPage)
