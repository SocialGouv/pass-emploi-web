import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'

import {
  FichePasMiloProps,
  OngletPasMilo,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiaireProps'
import { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import { Demarche } from 'interfaces/beneficiaire'
import { estConseilDepartemental } from 'interfaces/structure'
import { getDemarchesBeneficiaireClientSide } from 'services/beneficiaires.service'
import { Periode } from 'types/dates'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { getPeriodeComprenant, LUNDI } from 'utils/date'

const TableauOffres = dynamic(
  () => import('components/favoris/offres/TableauOffres')
)
const OngletDemarches = dynamic(
  () => import('components/jeune/OngletDemarches')
)
const ResumeFavorisBeneficiaire = dynamic(
  () => import('components/jeune/ResumeFavorisBeneficiaire')
)

export default function OngletsBeneficiairePasMilo({
  ongletInitial,
  onSwitchTab,
  beneficiaire,
  metadonneesFavoris,
  debutSemaineInitiale,
  onChangementSemaine,
  trackChangementSemaine,
}: FichePasMiloProps & {
  onChangementSemaine: (
    currentTab: OngletPasMilo,
    nouveauDebut: DateTime
  ) => void
  onSwitchTab: (tab: OngletPasMilo) => void
  trackChangementSemaine: (currentTab: OngletPasMilo, append?: string) => void
}) {
  const [conseiller] = useConseiller()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [demarches, setDemarches] = useState<Demarche[] | undefined>(undefined)

  const debutPeriodeInitiale = debutSemaineInitiale
    ? DateTime.fromISO(debutSemaineInitiale)
    : DateTime.now().startOf('week')

  const conseillerEstCD = estConseilDepartemental(conseiller.structure)

  const afficherSuiviOffres = Boolean(metadonneesFavoris?.autoriseLePartage)
  const afficherSyntheseFavoris =
    metadonneesFavoris?.autoriseLePartage === false

  const [currentTab, setCurrentTab] = useState<OngletPasMilo>(ongletInitial)
  const [semaine, setSemaine] = useState<Periode>(
    getPeriodeComprenant(debutPeriodeInitiale, {
      jourSemaineReference: LUNDI,
    })
  )
  const [shouldFocus, setShouldFocus] = useState<boolean>(false)

  async function chargerNouvelleSemaine(
    nouvellePeriode: Periode,
    opts: { shouldFocus: boolean }
  ) {
    setSemaine(nouvellePeriode)
    setShouldFocus(opts.shouldFocus)
    onChangementSemaine(currentTab, nouvellePeriode.debut)
  }

  async function switchTab(tab: OngletPasMilo) {
    setCurrentTab(tab)
    onSwitchTab(tab)
  }

  useEffect(() => {
    if (conseillerEstCD) {
      setIsLoading(true)

      getDemarchesBeneficiaireClientSide(
        beneficiaire.id,
        semaine,
        conseiller.id
      )
        .then((nouvellesDemarches) =>
          setDemarches(nouvellesDemarches?.data ?? [])
        )
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [semaine])

  return (
    <>
      <SelecteurPeriode
        premierJour={
          debutSemaineInitiale
            ? DateTime.fromISO(debutSemaineInitiale)
            : DateTime.now()
        }
        jourSemaineReference={LUNDI}
        onNouvellePeriode={chargerNouvelleSemaine}
        trackNavigation={(append) => trackChangementSemaine(currentTab, append)}
        className='m-auto'
      />

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
            count={demarches?.length}
            selected={currentTab === 'demarches'}
            controls='liste-demarches'
            onSelectTab={() => switchTab('demarches')}
            iconName={IconName.ChecklistRtlFill}
          />
        )}
        {afficherSuiviOffres && (
          <Tab
            iconName={IconName.BookmarkOutline}
            label='Suivi des offres'
            selected={currentTab === 'offres'}
            controls='liste-offres'
            onSelectTab={() => switchTab('offres')}
          />
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

      {currentTab === 'demarches' && demarches !== undefined && semaine && (
        <div
          role='tabpanel'
          aria-labelledby='liste-demarches--tab'
          tabIndex={0}
          id='liste-demarches'
          className='mt-8 pb-8'
        >
          <OngletDemarches
            beneficiaire={beneficiaire}
            demarches={demarches}
            isLoading={isLoading}
          />
        </div>
      )}

      {currentTab === 'offres' && semaine && (
        <div
          role='tabpanel'
          aria-labelledby='liste-offres--tab'
          tabIndex={0}
          id='liste-offres'
          className='mt-8 pb-8'
        >
          <TableauOffres
            beneficiaire={beneficiaire}
            shouldFocus={shouldFocus}
            semaine={semaine}
          />
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
