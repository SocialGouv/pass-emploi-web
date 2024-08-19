'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { BlocIndicateurs } from 'components/jeune/BlocIndicateur'
import { BlocInformationJeune } from 'components/jeune/BlocInformationJeune'
import { BlocSituation } from 'components/jeune/BlocSituation'
import { ListeConseillersJeune } from 'components/jeune/ListeConseillersJeune'
import { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import {
  CategorieSituation,
  ConseillerHistorique,
  DetailBeneficiaire,
  EtatSituation,
  IndicateursSemaine,
  MetadonneesFavoris,
} from 'interfaces/beneficiaire'
import { estFranceTravail, estMilo } from 'interfaces/conseiller'
import { getIndicateursJeuneComplets } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

type InformationsPageProps = {
  idBeneficiaire: string
  jeune: DetailBeneficiaire
  situations: Array<{
    categorie: CategorieSituation
    etat?: EtatSituation
    dateFin?: string
  }>
  conseillers: ConseillerHistorique[]
  lectureSeule: boolean
  onglet: Onglet
  metadonneesFavoris?: MetadonneesFavoris
}

export type Onglet = 'INFORMATIONS' | 'INDICATEURS' | 'CONSEILLERS'

function InformationsPage({
  idBeneficiaire,
  situations,
  conseillers,
  lectureSeule,
  jeune,
  onglet,
  metadonneesFavoris,
}: InformationsPageProps) {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()

  const [currentTab, setCurrentTab] = useState<Onglet>(onglet)
  const aujourdHui = DateTime.now()
  const debutSemaine = aujourdHui.startOf('week')
  const finSemaine = aujourdHui.endOf('week')
  const [indicateursSemaine, setIndicateursSemaine] = useState<
    IndicateursSemaine | undefined
  >()

  const situationsTracking = `Détail jeune – Situations${
    lectureSeule ? ' - hors portefeuille' : ''
  }`
  const conseillersTracking = `Détail jeune – Historique conseillers${
    lectureSeule ? ' - hors portefeuille' : ''
  }`
  const [tracking, setTracking] = useState<string>(switchTracking(onglet))

  function switchTracking(onglet: Onglet) {
    return onglet === 'INFORMATIONS' ? situationsTracking : conseillersTracking
  }

  useEffect(() => {
    if (
      currentTab === 'INDICATEURS' &&
      !indicateursSemaine &&
      !estFranceTravail(conseiller)
    ) {
      getIndicateursJeuneComplets(
        conseiller.id,
        idBeneficiaire,
        debutSemaine,
        finSemaine
      ).then(setIndicateursSemaine)
    }
  }, [currentTab, indicateursSemaine, conseiller])

  useEffect(() => {
    if (currentTab) {
      setTracking(switchTracking(onglet))
    }
  }, [currentTab])

  useMatomo(tracking, portefeuille.length > 0)
  const pathPrefix = usePathname()?.startsWith('etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  return (
    <>
      <TabList className='mt-10'>
        <Tab
          label='Informations'
          selected={currentTab === 'INFORMATIONS'}
          controls='liste-informations'
          onSelectTab={() => setCurrentTab('INFORMATIONS')}
          iconName={IconName.Description}
        />
        {!estFranceTravail(conseiller) && (
          <Tab
            label='Indicateurs'
            selected={currentTab === 'INDICATEURS'}
            controls='liste-indicateurs'
            onSelectTab={() => setCurrentTab('INDICATEURS')}
            iconName={IconName.BarChart}
          />
        )}
        <Tab
          label='Historique des conseillers'
          selected={currentTab === 'CONSEILLERS'}
          controls='liste-conseillers'
          onSelectTab={() => setCurrentTab('CONSEILLERS')}
          iconName={IconName.ChecklistRtlFill}
        />
      </TabList>

      {currentTab === 'INFORMATIONS' && (
        <div
          role='tabpanel'
          aria-labelledby='liste-informations--tab'
          tabIndex={0}
          id='liste-informations'
          className='mt-8 pb-8'
        >
          <BlocInformationJeune
            creationDate={jeune.creationDate}
            dateFinCEJ={jeune.dateFinCEJ}
            email={jeune.email}
            urlDossier={jeune.urlDossier}
            onDossierMiloClick={() => {}}
            conseiller={conseiller}
          />

          {estMilo(conseiller) && (
            <BlocSituation
              idBeneficiaire={idBeneficiaire}
              situations={situations}
              versionResumee={false}
            />
          )}
        </div>
      )}

      {currentTab === 'INDICATEURS' && (
        <div
          className='mt-8 pb-8'
          role='tabpanel'
          aria-labelledby='liste-indicateurs--tab'
          tabIndex={0}
          id='liste-indicateurs'
        >
          {!indicateursSemaine && <SpinningLoader alert={true} />}
          {indicateursSemaine && (
            <BlocIndicateurs
              debutSemaine={debutSemaine}
              finSemaine={finSemaine}
              indicateursSemaine={indicateursSemaine}
              idBeneficiaire={idBeneficiaire}
              pathPrefix={pathPrefix}
              metadonneesFavoris={metadonneesFavoris}
            />
          )}
        </div>
      )}

      {currentTab === 'CONSEILLERS' && (
        <div
          role='tabpanel'
          aria-labelledby='liste-conseillers--tab'
          tabIndex={0}
          id='liste-conseillers'
          className='mt-8 pb-8'
        >
          <div className='border border-solid rounded-base w-full p-4 mt-3 border-grey_100'>
            <ListeConseillersJeune
              id='liste-conseillers'
              conseillers={conseillers}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default withTransaction(InformationsPage.name, 'page')(InformationsPage)
