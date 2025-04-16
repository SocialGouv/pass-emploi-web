import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desCategories } from 'fixtures/action'
import {
  desConseillersBeneficiaire,
  desIndicateursSemaine,
  unDetailBeneficiaire,
} from 'fixtures/beneficiaire'
import { getActionsBeneficiaire } from 'services/actions.service'
import { getIndicateursBeneficiaire } from 'services/beneficiaires.service'
import { getOffres } from 'services/favoris.service'
import { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/actions.service')
jest.mock('services/favoris.service')
jest.mock('components/ModalContainer')

describe('Historique des conseillers dans la fiche jeune', () => {
  it('affiche l’historique des conseillers du jeune', async () => {
    // Given
    const replace = jest.fn(() => Promise.resolve())
    ;(getIndicateursBeneficiaire as jest.Mock).mockResolvedValue(
      desIndicateursSemaine()
    )
    ;(getActionsBeneficiaire as jest.Mock).mockResolvedValue([])
    ;(getOffres as jest.Mock).mockResolvedValue([])
    ;(useRouter as jest.Mock).mockReturnValue({ replace })

    const historiqueConseillers = desConseillersBeneficiaire()

    // When
    await renderWithContexts(
      <FicheBeneficiairePage
        estMilo={false}
        beneficiaire={unDetailBeneficiaire()}
        historiqueConseillers={historiqueConseillers}
        categoriesActions={desCategories()}
        ongletInitial='actions'
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
