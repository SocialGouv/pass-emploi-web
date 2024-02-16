'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import { BlocInformationJeune } from 'components/jeune/BlocInformationJeune'
import { BlocSituation } from 'components/jeune/BlocSituation'
import { ListeConseillersJeune } from 'components/jeune/ListeConseillersJeune'
import { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import TileIndicateur from 'components/ui/TileIndicateur'
import { estMilo } from 'interfaces/conseiller'
import {
  CategorieSituation,
  ConseillerHistorique,
  DetailJeune,
  EtatSituation,
  IndicateursSemaine,
} from 'interfaces/jeune'
import { getIndicateursJeuneComplets } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toShortDate } from 'utils/date'
import { usePortefeuille } from 'utils/portefeuilleContext'

type HistoriqueProps = {
  idJeune: string
  jeune: DetailJeune
  situations: Array<{
    etat?: EtatSituation
    categorie: CategorieSituation
    dateFin?: string
  }>
  conseillers: ConseillerHistorique[]
  lectureSeule: boolean
}

export enum Onglet {
  INFORMATIONS = 'INFORMATIONS',
  CONSEILLERS = 'CONSEILLERS',
  INDICATEUR = 'INDICATEUR',
}

function HistoriquePage({
  idJeune,
  situations,
  conseillers,
  lectureSeule,
  jeune,
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
  const [indicateursSemaine, setIndicateursSemaine] = useState<
    IndicateursSemaine | undefined
  >()
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'
  const aujourdHui = DateTime.now()
  const debutSemaine = aujourdHui.startOf('week')
  const finSemaine = aujourdHui.endOf('week')

  useEffect(() => {
    if (!indicateursSemaine) {
      getIndicateursJeuneComplets(
        conseiller.id,
        idJeune,
        debutSemaine,
        finSemaine
      ).then(setIndicateursSemaine)
    }
  }, [idJeune, debutSemaine, finSemaine, indicateursSemaine])

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

  return (
    <>
      <TabList className='mt-10'>
        {estMilo(conseiller) && (
          <Tab
            label='Informations'
            selected={currentTab === Onglet.INFORMATIONS}
            controls='liste-informations'
            onSelectTab={() => setCurrentTab(Onglet.INFORMATIONS)}
            iconName={IconName.Description}
          />
        )}
        <Tab
          label='Indicateurs'
          selected={currentTab === Onglet.INDICATEUR}
          controls='liste-indicateurs'
          onSelectTab={() => setCurrentTab(Onglet.INDICATEUR)}
          iconName={IconName.BarChart}
        />

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
          aria-labelledby='liste-informations--tab'
          tabIndex={0}
          id='liste-informations'
          className='mt-8 pb-8'
        >
          <div className='mb-3'>
            <BlocInformationJeune
              creationDate={jeune.creationDate}
              dateFinCEJ={jeune.dateFinCEJ}
              email={jeune.email}
              urlDossier={jeune.urlDossier}
              onDossierMiloClick={() => {}}
              conseiller={conseiller}
            />
          </div>
          <BlocSituation
            idJeune={idJeune}
            situations={situations}
            versionResumee={false}
          />
        </div>
      )}
      {currentTab === Onglet.INDICATEUR && (
        <div
          className='border border-solid rounded-base w-full p-4 mt-3 border-grey_100 mt-8 pb-8'
          role='tabpanel'
          aria-labelledby='liste-indicateurs--tab'
          tabIndex={0}
          id='liste-indicateurs'
        >
          <h2 className='text-m-bold text-grey_800 mb-6'>
            Semaine du {toShortDate(debutSemaine)} au {toShortDate(finSemaine)}
          </h2>
          <IndicateursActions actions={indicateursSemaine?.actions} />
          <IndicateursRendezvous rendezVous={indicateursSemaine?.rendezVous} />
          <IndicateursOffres
            offres={indicateursSemaine?.offres}
            favoris={indicateursSemaine?.favoris}
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
function IndicateursActions({
  actions,
}: Partial<Pick<IndicateursSemaine, 'actions'>>) {
  return (
    <div className='border border-solid rounded-base w-full p-4 border-grey_100'>
      <h3 className='text-m-bold text-content_color mb-4'>Les actions</h3>
      <ul className='flex flex-wrap gap-2'>
        <TileIndicateur
          valeur={actions?.creees.toString() ?? '-'}
          label={actions?.creees !== 1 ? 'Créées' : 'Créée'}
          bgColor='primary_lighten'
          textColor='primary_darken'
        />
        <TileIndicateur
          valeur={actions?.enRetard.toString() ?? '-'}
          label='En retard'
          bgColor='alert_lighten'
          textColor='content_color'
          iconName={IconName.Error}
        />
        <TileIndicateur
          valeur={actions?.terminees.toString() ?? '-'}
          label={actions?.terminees !== 1 ? 'Terminées' : 'Terminée'}
          bgColor='accent_2_lighten'
          textColor='accent_2'
          iconName={IconName.CheckCircleFill}
        />
        <TileIndicateur
          valeur={actions?.aEcheance.toString() ?? '-'}
          label='Échéance cette semaine'
          bgColor='primary_lighten'
          textColor='primary_darken'
        />
      </ul>
    </div>
  )
}
function IndicateursRendezvous({
  rendezVous,
}: Partial<Pick<IndicateursSemaine, 'rendezVous'>>) {
  return (
    <div className='border border-solid rounded-base w-full mt-6 p-4 border-grey_100'>
      <h3 className='text-m-bold text-content_color mb-4'>Les événements</h3>
      <ul className='flex'>
        <TileIndicateur
          valeur={rendezVous?.toString() ?? '-'}
          label='Cette semaine'
          bgColor='primary_lighten'
          textColor='primary_darken'
        />
      </ul>
    </div>
  )
}
function IndicateursOffres({
  offres,
  favoris,
}: Partial<Pick<IndicateursSemaine, 'offres' | 'favoris'>>) {
  return (
    <div className='border border-solid rounded-base w-full mt-6 p-4 border-grey_100'>
      <h3 className='text-m-bold text-content_color mb-4'>Les offres</h3>
      <ul className='flex flex-wrap gap-2'>
        <TileIndicateur
          valeur={offres?.consultees.toString() ?? '-'}
          label={
            offres?.consultees !== 1 ? 'Offres consultées' : 'Offre consultée'
          }
          bgColor='primary_lighten'
          textColor='primary_darken'
        />
        <TileIndicateur
          valeur={favoris?.offresSauvegardees.toString() ?? '-'}
          label={
            favoris?.offresSauvegardees !== 1
              ? 'Favoris ajoutés'
              : 'Favori ajouté'
          }
          bgColor='primary_lighten'
          textColor='primary_darken'
        />
        <TileIndicateur
          valeur={offres?.partagees.toString() ?? '-'}
          label={
            offres?.partagees !== 1 ? 'Offres partagées' : 'Offre partagée'
          }
          bgColor='primary_lighten'
          textColor='primary_darken'
        />
        <TileIndicateur
          valeur={favoris?.recherchesSauvegardees.toString() ?? '-'}
          label={
            favoris?.recherchesSauvegardees !== 1
              ? 'Recherches sauvegardées'
              : 'Recherche sauvegardée'
          }
          bgColor='primary_lighten'
          textColor='primary_darken'
        />
      </ul>
    </div>
  )
}

export default withTransaction(HistoriquePage.name, 'page')(HistoriquePage)
