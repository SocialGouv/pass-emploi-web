import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import React from 'react'

import { desActionsInitiales } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import {
  desIndicateursSemaine,
  unDetailJeune,
  uneMetadonneeFavoris,
} from 'fixtures/jeune'
import { mockedAgendaService, mockedJeunesService } from 'fixtures/services'
import { MetadonneesFavoris } from 'interfaces/jeune'
import FicheJeune from 'pages/mes-jeunes/[jeune_id]'
import renderWithContexts from 'tests/renderWithContexts'

describe('Favoris dans la fiche jeune', () => {
  beforeEach(async () => {
    ;(useRouter as jest.Mock).mockReturnValue({
      replace: jest.fn(() => Promise.resolve()),
      push: jest.fn(),
    })
  })

  it('affiche les informations des favoris du jeune', async () => {
    // Given
    await renderFicheJeune(uneMetadonneeFavoris())

    // Then
    expect(screen.getByText('Favoris')).toBeInTheDocument()
  })

  describe('quand on sélectionne l’onglet des favoris', () => {
    it('affiche les informations des offres et des recherches sauvegardées', async () => {
      // Given
      await renderFicheJeune(uneMetadonneeFavoris())

      // When
      await userEvent.click(screen.getByRole('tab', { name: /Favoris/ }))

      // Then
      expect(screen.getByText(/Offres/)).toBeInTheDocument()
      expect(screen.getByText(/Recherches sauvegardées/)).toBeInTheDocument()
      expect(screen.getByText('Alternance :')).toBeInTheDocument()
      expect(screen.getByText('Immersion :')).toBeInTheDocument()
      expect(screen.getByText('Service civique :')).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: 'Voir la liste des favoris' })
      ).toHaveAttribute('href', '/mes-jeunes/jeune-1/favoris')
    })

    it('n’affiche pas de lien pour la liste des favoris quand le jeune n’a pas autorisé le partage', async () => {
      // Given
      const metadonneesFavoris = uneMetadonneeFavoris({
        autoriseLePartage: false,
      })
      await renderFicheJeune(metadonneesFavoris)

      // When
      await userEvent.click(screen.getByRole('tab', { name: /Favoris/ }))

      // Then
      expect(() => screen.getByText('Voir la liste des favoris')).toThrow()
    })
  })
})

async function renderFicheJeune(metadonneesFavoris: MetadonneesFavoris) {
  await act(async () => {
    await renderWithContexts(
      <FicheJeune
        jeune={unDetailJeune()}
        rdvs={[]}
        actionsInitiales={desActionsInitiales()}
        metadonneesFavoris={metadonneesFavoris}
        pageTitle={''}
      />,
      {
        customDependances: {
          jeunesService: mockedJeunesService({
            getIndicateursJeuneAlleges: jest.fn(async () => desIndicateursSemaine()),
          }),
          agendaService: mockedAgendaService({
            recupererAgenda: jest.fn(async () => unAgenda()),
          }),
        },
      }
    )
  })
}
