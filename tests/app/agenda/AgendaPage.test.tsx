import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import React from 'react'

import AgendaPage from 'app/(connected)/(with-sidebar)/(with-chat)/agenda/AgendaPage'
import { unConseiller } from 'fixtures/conseiller'
import { structureMilo } from 'interfaces/structure'
import {
  getRendezVousConseiller,
  getRendezVousEtablissement,
} from 'services/evenements.service'
import {
  getSessionsBeneficiaires,
  getSessionsMissionLocaleClientSide,
} from 'services/sessions.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/evenements.service')
jest.mock('services/sessions.service')
jest.mock('components/PageActionsPortal')

describe('AgendaPage client side', () => {
  let container: HTMLElement
  let replace: jest.Mock
  const SEPTEMBRE_1_14H = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')

  beforeEach(async () => {
    // Given
    jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1_14H)
    replace = jest.fn(() => Promise.resolve())
    ;(useRouter as jest.Mock).mockReturnValue({
      replace: replace,
      asPath: '/mes-jeunes',
    })
    ;(getRendezVousConseiller as jest.Mock).mockResolvedValue([])
    ;(getSessionsBeneficiaires as jest.Mock).mockResolvedValue([])
    ;(getRendezVousEtablissement as jest.Mock).mockResolvedValue([])
    ;(getSessionsMissionLocaleClientSide as jest.Mock).mockResolvedValue([])

    const conseiller = unConseiller({
      structure: structureMilo,
      agence: {
        nom: 'Mission Locale Aubenas',
        id: 'id-etablissement',
      },
      structureMilo: {
        nom: 'Mission Locale Aubenas',
        id: 'id-test',
      },
    })

    // When
    ;({ container } = await renderWithContexts(
      <AgendaPage onglet='MISSION_LOCALE' periodeIndexInitial={0} />,
      {
        customConseiller: conseiller,
      }
    ))
  })

  it('a11y', async () => {
    let results: AxeResults

    await act(async () => {
      results = await axe(container)
    })

    expect(results!).toHaveNoViolations()
  })

  it('contient des liens créer pour des évènements', () => {
    const pageActionPortal = screen.getByTestId('page-action-portal')

    expect(
      within(pageActionPortal).getByRole('link', {
        name: 'Créer une animation collective',
      })
    ).toHaveAttribute('href', '/mes-jeunes/edition-rdv?type=ac')

    expect(
      within(pageActionPortal).getByRole('link', {
        name: 'Créer un rendez-vous',
      })
    ).toHaveAttribute('href', '/mes-jeunes/edition-rdv')
  })

  it('contient 2 onglets', () => {
    // Then
    expect(
      screen.getByRole('tab', { name: 'Mon agenda', selected: false })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', {
        name: 'Agenda Mission Locale',
        selected: true,
      })
    ).toBeInTheDocument()
  })

  it('permet de changer d’onglet', async () => {
    // When
    await userEvent.click(
      screen.getByRole('tab', { name: 'Agenda Mission Locale' })
    )
    // Then
    expect(replace).toHaveBeenCalledWith(
      '/agenda?onglet=mission-locale&periodeIndex=0'
    )
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
      'Agenda Mission Locale'
    )
    expect(
      screen.getByRole('tabpanel', { name: 'Agenda Mission Locale' })
    ).toBeInTheDocument()
    expect(() => screen.getByRole('tabpanel', { name: 'Mon agenda' })).toThrow()

    // When
    await userEvent.click(screen.getByRole('tab', { name: 'Mon agenda' }))
    // Then
    expect(replace).toHaveBeenCalledWith(
      '/agenda?onglet=conseiller&periodeIndex=0'
    )
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
      'Mon agenda'
    )
    expect(
      screen.getByRole('tabpanel', { name: 'Mon agenda' })
    ).toBeInTheDocument()
    expect(() =>
      screen.getByRole('tabpanel', { name: 'Agenda Mission Locale' })
    ).toThrow()
  })
})
