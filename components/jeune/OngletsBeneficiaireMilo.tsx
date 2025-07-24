import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'

import {
  FicheMiloProps,
  OngletMilo,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiaireProps'
import { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import { Action } from 'interfaces/action'
import { EvenementListItem } from 'interfaces/evenement'
import { Offre } from 'interfaces/favoris'
import { getActionsBeneficiaire } from 'services/actions.service'
import { chargerRdvsEtSessions } from 'services/evenements.service'
import { getOffres } from 'services/favoris.service'
import { Periode } from 'types/dates'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { getPeriodeComprenant, LUNDI } from 'utils/date'

const OngletActions = dynamic(() => import('components/action/OngletActions'))

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
  categoriesActions,
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
  const [conseiller] = useConseiller()
  const afficherSuiviOffres = Boolean(metadonneesFavoris?.autoriseLePartage)
  const afficherSyntheseFavoris =
    metadonneesFavoris?.autoriseLePartage === false
  const debutPeriodeInitiale = debutSemaineInitiale
    ? DateTime.fromISO(debutSemaineInitiale)
    : DateTime.now().startOf('week')

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [offres, setOffres] = useState<Offre[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [rdvs, setRdvs] = useState<EvenementListItem[]>([])
  const [erreurRecuperationSessions, setErreurRecuperationSessions] =
    useState<boolean>(false)

  const [semaine, setSemaine] = useState<Periode>(
    getPeriodeComprenant(debutPeriodeInitiale, {
      jourSemaineReference: LUNDI,
    })
  )

  const [shouldFocus, setShouldFocus] = useState<boolean>(false)

  const [currentTab, setCurrentTab] = useState<OngletMilo>(ongletInitial)
  const [focusCurrentTabContent, setFocusCurrentTabContent] =
    useState<boolean>(false)

  async function chargerNouvelleSemaine(
    nouvellePeriode: Periode,
    opts: { shouldFocus: boolean }
  ) {
    setSemaine(nouvellePeriode)
    setShouldFocus(opts.shouldFocus)
    onChangementSemaine(currentTab, nouvellePeriode.debut)
  }

  function switchTab(newTab: OngletMilo, { withFocus = false } = {}) {
    setFocusCurrentTabContent(withFocus)
    setCurrentTab(newTab)
    onSwitchTab(newTab, semaine.debut)
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

  useEffect(() => {
    setIsLoading(true)

    switch (currentTab) {
      case 'offres':
        getOffres(beneficiaire.id, semaine)
          .then(setOffres)
          .finally(() => setIsLoading(false))
        break
      case 'actions':
        getActionsBeneficiaire(beneficiaire.id, semaine)
          .then(setActions)
          .finally(() => {
            setIsLoading(false)
          })
        break
      case 'rdvs':
        chargerRdvsEtSessions(
          conseiller,
          beneficiaire,
          semaine,
          setErreurRecuperationSessions
        )
          .then(setRdvs)
          .finally(() => {
            setIsLoading(false)
          })
        break
      default:
        setIsLoading(false)
    }
  }, [semaine, currentTab])

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
          iconName={IconName.Bolt}
        />
        <Tab
          label='RDV & Ateliers'
          selected={currentTab === 'rdvs'}
          controls='liste-rdvs'
          onSelectTab={() => switchTab('rdvs')}
          iconName={IconName.EventFill}
        />
        {afficherSuiviOffres && (
          <Tab
            label='Suivi des offres'
            selected={currentTab === 'offres'}
            controls='liste-offres'
            onSelectTab={() => switchTab('offres')}
            iconName={IconName.BookmarkOutline}
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
            shouldFocus={shouldFocus}
            onLienExterne={onLienExterne}
            labelSemaine={semaine.label}
            actions={actions}
            updateActions={setActions}
            isLoading={isLoading}
          />
        </div>
      )}

      {currentTab === 'rdvs' && semaine && (
        <div
          role='tabpanel'
          aria-labelledby='liste-rdvs--tab'
          tabIndex={0}
          id='liste-rdvs'
          className='mt-8 pb-8 border-b border-primary-lighten'
        >
          <OngletRdvsBeneficiaire
            beneficiaire={beneficiaire}
            shouldFocus={shouldFocus}
            rdvsAAfficher={rdvs}
            isLoading={isLoading}
            erreurRecuperationSessions={erreurRecuperationSessions}
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
            offres={offres}
            isLoading={isLoading}
          />
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
