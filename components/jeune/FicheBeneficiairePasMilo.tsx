import dynamic from 'next/dynamic'
import React, { useState } from 'react'

import {
  FichePasMiloProps,
  OngletPasMilo,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/rendez-vous-passes/FicheBeneficiaireProps'
import { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'

const TableauOffres = dynamic(
  () => import('components/favoris/offres/TableauOffres')
)
const OngletDemarches = dynamic(
  () => import('components/jeune/OngletDemarches')
)
const TableauRecherches = dynamic(
  () => import('components/favoris/recherches/TableauRecherches')
)
const ResumeFavorisBeneficiaire = dynamic(
  () => import('components/jeune/ResumeFavorisBeneficiaire')
)

export default function FicheBeneficiairePasMilo({
  ongletInitial,
  onSwitchTab,
  beneficiaire,
  metadonneesFavoris,
  favorisOffres,
  favorisRecherches,
  demarches,
}: FichePasMiloProps & {
  onSwitchTab: (tab: OngletPasMilo) => void
}) {
  const conseillerEstCD = demarches !== undefined

  const afficherSuiviOffres = Boolean(metadonneesFavoris?.autoriseLePartage)
  const afficherSyntheseFavoris =
    metadonneesFavoris?.autoriseLePartage === false

  const [currentTab, setCurrentTab] = useState<OngletPasMilo>(ongletInitial)

  async function switchTab(tab: OngletPasMilo) {
    setCurrentTab(tab)
    onSwitchTab(tab)
  }

  return (
    <>
      {!conseillerEstCD && (
        <>
          {afficherSuiviOffres && (
            <>
              <h2 className='text-m-bold text-grey-800 mb-4'>Favoris</h2>
              <p className='text-base-regular'>
                Retrouvez les offres et recherches que votre bénéficiaire a
                mises en favoris.
              </p>
            </>
          )}

          {afficherSyntheseFavoris && (
            <>
              <h2 className='text-m-bold text-grey-800 mb-6'>Favoris</h2>
              <p className='mb-4'>
                Retrouvez la synthèse des offres et recherches que votre
                bénéficiaire a mises en favoris.
              </p>
            </>
          )}
        </>
      )}

      <TabList
        label={`${conseillerEstCD ? 'Démarches ainsi que les offres' : 'Offres'} et recherches mises en favoris par ${beneficiaire.prenom} ${beneficiaire.nom}`}
        className='mt-10'
      >
        {conseillerEstCD && (
          <Tab
            label='Démarches'
            count={demarches?.data.length}
            selected={currentTab === 'demarches'}
            controls='liste-demarches'
            onSelectTab={() => switchTab('demarches')}
            iconName={IconName.ChecklistRtlFill}
          />
        )}
        {afficherSuiviOffres && (
          <>
            <Tab
              label='Suivi des offres'
              count={favorisOffres!.length}
              selected={currentTab === 'offres'}
              controls='liste-offres'
              onSelectTab={() => switchTab('offres')}
            />
            <Tab
              label='Recherches'
              count={favorisRecherches!.length}
              selected={currentTab === 'recherches'}
              controls='liste-recherches'
              onSelectTab={() => switchTab('recherches')}
            />
          </>
        )}
        {!afficherSuiviOffres && afficherSyntheseFavoris && (
          <Tab
            label='Synthèse des favoris'
            count={
              metadonneesFavoris.offres.total +
              metadonneesFavoris.recherches.total
            }
            selected={currentTab === 'favoris'}
            controls='favoris'
            onSelectTab={() => switchTab('favoris')}
          />
        )}
      </TabList>

      {currentTab === 'demarches' && demarches !== undefined && (
        <div
          role='tabpanel'
          aria-labelledby='liste-demarches--tab'
          tabIndex={0}
          id='liste-demarches'
          className='mt-8 pb-8'
        >
          <OngletDemarches demarches={demarches} jeune={beneficiaire} />
        </div>
      )}

      {currentTab === 'offres' && (
        <div
          role='tabpanel'
          aria-labelledby='liste-offres--tab'
          tabIndex={0}
          id='liste-offres'
          className='mt-8 pb-8'
        >
          <TableauOffres offres={favorisOffres!} />
        </div>
      )}

      {currentTab === 'recherches' && (
        <div
          role='tabpanel'
          aria-labelledby='liste-recherches--tab'
          tabIndex={0}
          id='liste-recherches'
          className='mt-8 pb-8'
        >
          <TableauRecherches recherches={favorisRecherches!} />
        </div>
      )}

      {currentTab === 'favoris' && (
        <div
          role='tabpanel'
          aria-labelledby='favoris--tab'
          tabIndex={0}
          id='favoris'
          className='mt-8 pb-8'
        >
          <ResumeFavorisBeneficiaire metadonneesFavoris={metadonneesFavoris!} />
        </div>
      )}
    </>
  )
}
