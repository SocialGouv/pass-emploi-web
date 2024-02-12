'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React, { useEffect, useState } from 'react'

import { BlocSituation } from 'components/jeune/BlocSituation'
import { ListeConseillersJeune } from 'components/jeune/ListeConseillersJeune'
import { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { estMilo } from 'interfaces/conseiller'
import {
  CategorieSituation,
  ConseillerHistorique,
  EtatSituation,
} from 'interfaces/jeune'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'
import { toShortDate } from '../../../../../../../utils/date'
import { BlocInformationJeune } from '../../../../../../../components/jeune/BlocInformationJeune'

type HistoriqueProps = {
  idJeune: string
  situations: Array<{
    etat?: EtatSituation
    categorie: CategorieSituation
    dateFin?: string
  }>
  conseillers: ConseillerHistorique[]
  lectureSeule: boolean
  creationDate: string
}

export enum Onglet {
  INFORMATIONS = 'INFORMATIONS',
  CONSEILLERS = 'CONSEILLERS',
}

function HistoriquePage({
  idJeune,
  situations,
  conseillers,
  lectureSeule,
  creationDate,
}: HistoriqueProps) {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const [currentTab, setCurrentTab] = useState<Onglet | undefined>(
    estMilo(conseiller) ? Onglet.INFORMATIONS : Onglet.CONSEILLERS
  )

  const situationsTracking = `Détail jeune – Situations${
    lectureSeule ? ' - hors portefeuille' : ''
  }`
  const conseillersTracking = `Détail jeune – Historique conseillers${
    lectureSeule ? ' - hors portefeuille' : ''
  }`

  const [tracking, setTracking] = useState<string | undefined>()
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  useEffect(() => {
    if (currentTab) {
      setTracking(
        currentTab === Onglet.INFORMATIONS
          ? situationsTracking
          : conseillersTracking
      )
    }
  }, [currentTab])

  useMatomo(tracking, aDesBeneficiaires)

  const shortCreationDate = toShortDate(creationDate)

  return (
    <>
      <TabList className='mt-10'>
        {estMilo(conseiller) && (
          <Tab
            label='Informations'
            selected={currentTab === Onglet.INFORMATIONS}
            controls='liste-situations'
            onSelectTab={() => setCurrentTab(Onglet.INFORMATIONS)}
            iconName={IconName.EventFill}
          />
        )}
        <Tab
          label='Historique des conseillers'
          selected={currentTab === Onglet.CONSEILLERS}
          controls='liste-conseillers'
          onSelectTab={() => setCurrentTab(Onglet.CONSEILLERS)}
          iconName={IconName.ChecklistRtlFill}
        />
      </TabList>

      {currentTab === Onglet.INFORMATIONS && (
        <div
          role='tabpanel'
          aria-labelledby='liste-situations--tab'
          tabIndex={0}
          id='liste-situations'
          className='mt-8 pb-8'
        >
          <BlocInformationJeune
            idJeune={idJeune}
            creationDate={'date'}
            dateFinCEJ={'datefin'}
            email={'email'}
            conseiller={'conseiller'}
            onIdentifiantPartenaireCopie={'IdPartenaire'}
            identifiantPartenaire={'idPartenaire'}
            onIdentifiantPartenaireClick={() => {}}
            urlDossier={'string'}
            onDossierMiloClick={() => {}}
          />
          <BlocSituation
            idJeune={idJeune}
            situations={situations}
            versionResumee={false}
          />
        </div>
      )}

      {currentTab === Onglet.CONSEILLERS && (
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

export default withTransaction(HistoriquePage.name, 'page')(HistoriquePage)
