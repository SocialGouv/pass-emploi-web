import { act, screen } from '@testing-library/react'
import { DateTime } from 'luxon'
import React from 'react'

import IndicateursPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/indicateurs/IndicateursPage'
import { desIndicateursSemaine } from 'fixtures/jeune'
import { getIndicateursJeuneComplets } from 'services/jeunes.service'
import { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/jeunes.service')

describe('Indicateurs', () => {
  const SEPTEMBRE_1 = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')

  beforeEach(async () => {
    // Given
    jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1)
    ;(getIndicateursJeuneComplets as jest.Mock).mockResolvedValue(
      desIndicateursSemaine()
    )

    // Given
    await act(async () => {
      renderWithContexts(
        <IndicateursPage idJeune='id-jeune' lectureSeule={false} />
      )
    })
  })

  it('affiche la semaine courante', async () => {
    expect(
      screen.getByText('Semaine du 29/08/2022 au 04/09/2022')
    ).toBeInTheDocument()
  })

  it('affiche les indicateurs des actions', async () => {
    const indicateursActions = screen.getByRole('heading', {
      name: 'Les actions',
    }).parentElement
    expect(getByTextContent('0Créées', indicateursActions!)).toBeInTheDocument()
    expect(
      getByTextContent('1Terminée', indicateursActions!)
    ).toBeInTheDocument()
    expect(
      getByTextContent('2En retard', indicateursActions!)
    ).toBeInTheDocument()
  })

  it('affiche l’indicateur de rendez-vous', async () => {
    const indicateursRdv = screen.getByRole('heading', {
      name: 'Les événements',
    }).parentElement
    expect(
      getByTextContent('3Cette semaine', indicateursRdv!)
    ).toBeInTheDocument()
  })

  it('affiche les indicateurs des offres', async () => {
    const indicateursOffres = screen.getByRole('heading', {
      name: 'Les offres',
    }).parentElement
    expect(
      getByTextContent('10Offres consultées', indicateursOffres!)
    ).toBeInTheDocument()
    expect(
      getByTextContent('4Offres partagées', indicateursOffres!)
    ).toBeInTheDocument()
    expect(
      getByTextContent('6Favoris ajoutés', indicateursOffres!)
    ).toBeInTheDocument()
    expect(
      getByTextContent('7Recherches sauvegardées', indicateursOffres!)
    ).toBeInTheDocument()
  })
})
