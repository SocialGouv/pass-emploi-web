import React, { useState } from 'react'

import { OngletOffres } from 'components/favoris/offres/OngletOffres'
import { OngletRecherches } from 'components/favoris/recherches/OngletRecherches'
import OngletDemarches from 'components/OngletDemarches'
import { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { BaseBeneficiaire, Demarche } from 'interfaces/beneficiaire'
import { estConseilDepartemental } from 'interfaces/conseiller'
import { Offre, Recherche } from 'interfaces/favoris'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

type TabFavorisProps = {
  beneficiaire: BaseBeneficiaire
  offres: Offre[]
  recherches: Recherche[]
  lectureSeule?: boolean
  demarches?: Demarche[]
}

export enum OngletFavoris {
  DEMARCHES = 'DEMARCHES',
  OFFRES = 'OFFRES',
  RECHERCHES = 'RECHERCHES',
}

export function TabFavoris({
  beneficiaire,
  offres,
  recherches,
  demarches,
  lectureSeule,
}: TabFavorisProps) {
  const [portefeuille] = usePortefeuille()
  const [conseiller] = useConseiller()

  const conseillerEstCD = estConseilDepartemental(conseiller)

  const [currentTab, setCurrentTab] = useState<OngletFavoris>(
    conseillerEstCD ? OngletFavoris.DEMARCHES : OngletFavoris.OFFRES
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
        {estConseilDepartemental(conseiller) && demarches && (
          <Tab
            label='Démarches'
            count={demarches.length}
            selected={currentTab === 'DEMARCHES'}
            controls='liste-demarches'
            onSelectTab={() => switchTab(OngletFavoris.DEMARCHES)}
            iconName={IconName.ChecklistRtlFill}
          />
        )}
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
      {currentTab === OngletFavoris.DEMARCHES && demarches && (
        <div
          role='tabpanel'
          aria-labelledby='liste-offres--tab'
          tabIndex={0}
          id='liste-offres'
          className='mt-8 pb-8'
        >
          <OngletDemarches demarches={demarches} jeune={beneficiaire} />
        </div>
      )}
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
