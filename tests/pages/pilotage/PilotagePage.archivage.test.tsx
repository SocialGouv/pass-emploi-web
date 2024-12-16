import { act, screen, within } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useRouter } from 'next/navigation'

import Pilotage from 'app/(connected)/(with-sidebar)/(with-chat)/pilotage/PilotagePage'
import { desCategories } from 'fixtures/action'
import { unBeneficiaireWithActivity } from 'fixtures/beneficiaire'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/evenements.service')
jest.mock('services/referentiel.service')
jest.mock('services/conseiller.service')
jest.mock('components/ModalContainer')

describe('PilotagePage client side - Archivage des bénéficiaires', () => {
  describe('contenu', () => {
    let container: HTMLElement

    beforeEach(async () => {
      ;(useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() })

      await act(async () => {
        ;({ container } = renderWithContexts(
          <Pilotage
            onglet='ARCHIVAGE'
            actions={{
              donnees: [],
              metadonnees: { nombrePages: 1, nombreTotal: 0 },
            }}
            categoriesActions={[]}
            animationsCollectives={{
              donnees: [],
              metadonnees: { nombrePages: 1, nombreTotal: 0 },
            }}
          />,
          {
            customPortefeuille: {
              value: [
                unBeneficiaireWithActivity({
                  id: 'a-archiver-1',
                  estAArchiver: true,
                }),
                unBeneficiaireWithActivity({
                  id: 'a-archiver-2',
                  estAArchiver: true,
                }),
                unBeneficiaireWithActivity(),
              ],
            },
          }
        ))
      })
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('résume les activités', async () => {
      // Then
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Nouvelles activités'
      )
      expect(getByDescriptionTerm('Bénéficiaires')).toHaveTextContent(
        '2 À archiver'
      )
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Archivage des comptes 2 éléments'
      )
    })

    it('affiche un tableau des bénéficiaires à archiver', () => {
      // Given
      const tableau = screen.getByRole('table', {
        name: 'Liste des bénéficiaires à archiver',
      })

      // Then
      expect(
        within(tableau).getByRole('columnheader', { name: 'Bénéficiaire' })
      ).toBeInTheDocument()
      expect(
        within(tableau).getByRole('columnheader', {
          name: 'Fin de CEJ',
        })
      ).toBeInTheDocument()
      expect(
        within(tableau).getByRole('columnheader', {
          name: 'Dernière activité',
        })
      ).toBeInTheDocument()
    })
  })

  describe("quand le conseiller n'a pas d'animation collective à clore", () => {
    it('affiche un message qui le précise', async () => {
      // Given
      renderWithContexts(
        <Pilotage
          onglet='ARCHIVAGE'
          actions={{
            donnees: [],
            metadonnees: { nombrePages: 1, nombreTotal: 0 },
          }}
          categoriesActions={desCategories()}
          animationsCollectives={{
            donnees: [],
            metadonnees: { nombrePages: 1, nombreTotal: 0 },
          }}
        />,
        { customPortefeuille: { value: [] } }
      )

      // Then
      expect(
        screen.getByText('Vous n’avez pas de bénéficiaires à archiver.')
      ).toBeInTheDocument()
    })
  })
})
