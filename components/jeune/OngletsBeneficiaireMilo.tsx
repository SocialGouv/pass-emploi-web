import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useState } from 'react'

import {
  FicheMiloProps,
  OngletMilo,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/rendez-vous-passes/FicheBeneficiaireProps'
import { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import { Action } from 'interfaces/action'
import { Agenda } from 'interfaces/agenda'
import { Periode } from 'types/dates'
import { LUNDI } from 'utils/date'

const OngletActions = dynamic(() => import('components/action/OngletActions'))
const OngletAgendaBeneficiaire = dynamic(
  () => import('components/agenda-jeune/OngletAgendaBeneficiaire')
)
const OngletRdvsBeneficiaire = dynamic(
  () => import('components/rdv/OngletRdvsBeneficiaire')
)
const TableauOffres = dynamic(
  () => import('components/favoris/offres/TableauOffres')
)
const ResumeFavorisBeneficiaire = dynamic(
  () => import('components/jeune/ResumeFavorisBeneficiaire')
)

export default function OngletsBeneficiaireMilo({
  ongletInitial,
  onSwitchTab,
  beneficiaire,
  metadonneesFavoris,
  favorisOffres,
  rdvs,
  categoriesActions,
  erreurSessions,
  onLienExterne,
  debutSemaineInitiale,
  onChangementSemaine,
  trackChangementSemaine,
}: FicheMiloProps & {
  onSwitchTab: (newTab: OngletMilo, debutSemaine: DateTime) => void
  onLienExterne: (label: string) => void
  onChangementSemaine: (currentTab: OngletMilo, nouveauDebut: DateTime) => void
  trackChangementSemaine: (currentTab: OngletMilo, append?: string) => void
}) {
  const afficherSuiviOffres = Boolean(metadonneesFavoris?.autoriseLePartage)
  const afficherSyntheseFavoris =
    metadonneesFavoris?.autoriseLePartage === false

  const [semaine, setSemaine] = useState<Periode>()
  const [labelSemaine, setLabelSemaine] = useState<string>()
  const [shouldFocus, setShouldFocus] = useState<boolean>(false)

  const [currentTab, setCurrentTab] = useState<OngletMilo>(ongletInitial)
  const [focusCurrentTabContent, setFocusCurrentTabContent] =
    useState<boolean>(false)

  async function chargerNouvelleSemaine(
    nouvellePeriode: Periode,
    opts: { label: string; shouldFocus: boolean }
  ) {
    setSemaine(nouvellePeriode)
    setLabelSemaine(opts.label)
    setShouldFocus(opts.shouldFocus)
    onChangementSemaine(currentTab, nouvellePeriode.debut)
  }

  function switchTab(newTab: OngletMilo, { withFocus = false } = {}) {
    setFocusCurrentTabContent(withFocus)
    setCurrentTab(newTab)
    onSwitchTab(newTab, semaine!.debut)
  }

  const chargerActions = useCallback(async (): Promise<Action[]> => {
    const { getActionsBeneficiaire } = await import('services/actions.service')
    return getActionsBeneficiaire(beneficiaire.id, semaine!)
  }, [semaine])

  async function recupererAgenda(): Promise<Agenda> {
    const { recupererAgenda: _recupererAgenda } = await import(
      'services/agenda.service'
    )
    return _recupererAgenda(beneficiaire.id, DateTime.now())
  }

  useEffect(() => {
    if (focusCurrentTabContent) {
      const table = document.querySelector<HTMLDivElement>(
        '[role="tabpanel"] > table'
      )
      table?.setAttribute('tabIndex', '-1')
      table?.focus()
    }
  }, [currentTab, focusCurrentTabContent])

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

      <TabList
        label={`Activités de ${beneficiaire.prenom} ${beneficiaire.nom}`}
        className='mt-8'
      >
        <Tab
          label='Actions'
          selected={currentTab === 'actions'}
          controls='liste-actions'
          onSelectTab={() => switchTab('actions')}
          iconName={IconName.ChecklistRtlFill}
        />
        <Tab
          label='Agenda'
          selected={currentTab === 'agenda'}
          controls='agenda'
          onSelectTab={() => switchTab('agenda')}
          iconName={IconName.EventFill}
        />
        <Tab
          label='Rendez-vous'
          count={rdvs.length}
          selected={currentTab === 'rdvs'}
          controls='liste-rdvs'
          onSelectTab={() => switchTab('rdvs')}
          iconName={IconName.EventFill}
        />
        {afficherSuiviOffres && (
          <Tab
            label='Suivi des offres'
            count={metadonneesFavoris!.offres.total}
            selected={currentTab === 'offres'}
            controls='liste-offres'
            onSelectTab={() => switchTab('offres')}
            iconName={IconName.BookmarkFill}
          />
        )}
        {!afficherSuiviOffres && afficherSyntheseFavoris && (
          <Tab
            label='Favoris'
            count={
              metadonneesFavoris.offres.total +
              metadonneesFavoris.recherches.total
            }
            selected={currentTab === 'favoris'}
            controls='liste-favoris'
            onSelectTab={() => switchTab('favoris')}
            iconName={IconName.FavoriteFill}
          />
        )}
      </TabList>

      {currentTab === 'agenda' && (
        <div
          role='tabpanel'
          aria-labelledby='agenda--tab'
          tabIndex={0}
          id='agenda'
          className='mt-8 pb-8 border-b border-primary-lighten'
        >
          <OngletAgendaBeneficiaire
            idBeneficiaire={beneficiaire.id}
            recupererAgenda={recupererAgenda}
            goToActions={() => {
              switchTab('actions', { withFocus: true })
            }}
          />
        </div>
      )}

      {currentTab === 'rdvs' && (
        <div
          role='tabpanel'
          aria-labelledby='liste-rdvs--tab'
          tabIndex={0}
          id='liste-rdvs'
          className='mt-8 pb-8 border-b border-primary-lighten'
        >
          <OngletRdvsBeneficiaire
            beneficiaire={beneficiaire}
            rdvs={rdvs}
            erreurSessions={erreurSessions}
          />
        </div>
      )}

      {currentTab === 'actions' && semaine && (
        <div
          role='tabpanel'
          aria-labelledby='liste-actions--tab'
          tabIndex={0}
          id='liste-actions'
          className='mt-8 pb-8'
        >
          <OngletActions
            beneficiaire={beneficiaire}
            categories={categoriesActions}
            getActions={chargerActions}
            shouldFocus={shouldFocus}
            onLienExterne={onLienExterne}
            labelSemaine={labelSemaine}
          />
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

      {currentTab === 'favoris' && (
        <div
          role='tabpanel'
          aria-labelledby='liste-favoris--tab'
          tabIndex={0}
          id='liste-favoris'
          className='mt-8 pb-8'
        >
          <ResumeFavorisBeneficiaire metadonneesFavoris={metadonneesFavoris!} />
        </div>
      )}
    </>
  )
}
