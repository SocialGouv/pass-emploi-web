import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'

import {
  FicheMiloProps,
  OngletMilo,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/rendez-vous-passes/FicheBeneficiaireProps'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { Action, StatutAction } from 'interfaces/action'
import { Agenda } from 'interfaces/agenda'
import { MetadonneesPagination } from 'types/pagination'

const OngletActions = dynamic(() => import('components/action/OngletActions'))
const OngletAgendaBeneficiaire = dynamic(
  () => import('components/agenda-jeune/OngletAgendaBeneficiaire')
)
const OngletRdvsBeneficiaire = dynamic(
  () => import('components/rdv/OngletRdvsBeneficiaire')
)
const BlocFavoris = dynamic(() => import('components/jeune/BlocFavoris'))

export default function FicheBeneficiaireMilo({
  ongletInitial,
  onSwitchTab,
  lectureSeule,
  beneficiaire,
  metadonneesFavoris,
  actionsInitiales,
  rdvs,
  categoriesActions,
  erreurSessions,
  onLienExterne,
}: FicheMiloProps & {
  onSwitchTab: (tab: OngletMilo) => void
  onLienExterne: (label: string) => void
}) {
  const [currentTab, setCurrentTab] = useState<OngletMilo>(ongletInitial)
  const [focusCurrentTabContent, setFocusCurrentTabContent] =
    useState<boolean>(false)

  const [totalActions, setTotalActions] = useState<number>(
    actionsInitiales.metadonnees.nombreTotal
  )

  function switchTab(tab: OngletMilo, { withFocus = false } = {}) {
    setFocusCurrentTabContent(withFocus)
    setCurrentTab(tab)
    onSwitchTab(tab)
  }

  async function chargerActions(
    page: number,
    filtres: { statuts: StatutAction[]; categories: string[] },
    tri: string
  ): Promise<{ actions: Action[]; metadonnees: MetadonneesPagination }> {
    const { getActionsBeneficiaireClientSide } = await import(
      'services/actions.service'
    )
    const result = await getActionsBeneficiaireClientSide(beneficiaire.id, {
      page,
      filtres,
      tri,
    })

    setTotalActions(result.metadonnees.nombreTotal)
    return result
  }

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
      <div className='flex justify-between mt-6 mb-4'>
        <div className='flex'>
          {!lectureSeule && (
            <>
              <ButtonLink
                href={`/mes-jeunes/edition-rdv?idJeune=${beneficiaire.id}`}
              >
                <IconComponent
                  name={IconName.Add}
                  focusable={false}
                  aria-hidden={true}
                  className='mr-2 w-4 h-4'
                />
                Créer un rendez-vous
              </ButtonLink>

              <ButtonLink
                href={`/mes-jeunes/${beneficiaire.id}/actions/nouvelle-action`}
                className='ml-4'
              >
                <IconComponent
                  name={IconName.Add}
                  focusable={false}
                  aria-hidden={true}
                  className='mr-2 w-4 h-4'
                />
                Créer une action
              </ButtonLink>
            </>
          )}

          <ButtonLink
            href='/agenda?onglet=etablissement'
            className='ml-4'
            style={ButtonStyle.TERTIARY}
          >
            <IconComponent
              name={IconName.Add}
              focusable={false}
              aria-hidden={true}
              className='mr-2 w-4 h-4'
            />
            Inscrire à une animation collective
          </ButtonLink>
        </div>
      </div>

      <TabList
        label={`Activités de ${beneficiaire.prenom} ${beneficiaire.nom}`}
        className='mt-10'
      >
        <Tab
          label='Actions'
          count={totalActions}
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
        {metadonneesFavoris && (
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
          className='mt-8 pb-8 border-b border-primary_lighten'
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
          className='mt-8 pb-8 border-b border-primary_lighten'
        >
          <OngletRdvsBeneficiaire
            beneficiaire={beneficiaire}
            rdvs={rdvs}
            erreurSessions={erreurSessions}
          />
        </div>
      )}

      {currentTab === 'actions' && (
        <div
          role='tabpanel'
          aria-labelledby='liste-actions--tab'
          tabIndex={0}
          id='liste-actions'
          className='mt-8 pb-8'
        >
          <OngletActions
            jeune={beneficiaire}
            categories={categoriesActions}
            actionsInitiales={actionsInitiales}
            lectureSeule={lectureSeule}
            getActions={chargerActions}
            onLienExterne={onLienExterne}
          />
        </div>
      )}

      {currentTab === 'favoris' && metadonneesFavoris && (
        <div
          role='tabpanel'
          aria-labelledby='liste-favoris--tab'
          tabIndex={0}
          id='liste-favoris'
          className='mt-8 pb-8'
        >
          <BlocFavoris
            idBeneficiaire={beneficiaire.id}
            metadonneesFavoris={metadonneesFavoris}
          />
        </div>
      )}
    </>
  )
}
