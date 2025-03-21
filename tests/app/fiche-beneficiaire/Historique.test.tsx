import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desActionsInitiales, desCategories } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import {
  desConseillersBeneficiaire,
  desIndicateursSemaine,
  unDetailBeneficiaire,
} from 'fixtures/beneficiaire'
import { recupererAgenda } from 'services/agenda.service'
import { getIndicateursBeneficiaire } from 'services/beneficiaires.service'
import { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/agenda.service')
jest.mock('components/ModalContainer')

describe('Historique des conseillers dans la fiche jeune', () => {
  it('affiche l’historique des conseillers du jeune', async () => {
    // Given
    ;(getIndicateursBeneficiaire as jest.Mock).mockResolvedValue(
      desIndicateursSemaine()
    )
    ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())
    const historiqueConseillers = desConseillersBeneficiaire()

    // When
    await renderWithContexts(
      <FicheBeneficiairePage
        estMilo={false}
        beneficiaire={unDetailBeneficiaire()}
        historiqueConseillers={historiqueConseillers}
        rdvs={[]}
        actionsInitiales={desActionsInitiales()}
        categoriesActions={desCategories()}
        ongletInitial='agenda'
      />
    )
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Consulter l’historique des conseillers',
      })
    )

    // Then
    const modalHistoriqueConseillers = screen.getByRole('heading', {
      level: 2,
      name: 'Historique des conseillers',
    }).parentElement!
    expect(
      within(modalHistoriqueConseillers).getAllByRole('listitem')
    ).toHaveLength(historiqueConseillers.length)
    expect(
      getByTextContent('Du 12/03/2022 à aujourd’hui : Dublon Nicolas')
    ).toHaveRole('listitem')
    expect(
      getByTextContent('Du 28/12/2021 au 12/03/2022 : Maravillo Sarah')
    ).toHaveRole('listitem')
  })
})
