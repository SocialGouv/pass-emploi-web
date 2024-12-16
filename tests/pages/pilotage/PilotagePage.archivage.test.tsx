import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useRouter } from 'next/navigation'

import Pilotage from 'app/(connected)/(with-sidebar)/(with-chat)/pilotage/PilotagePage'
import { desCategories } from 'fixtures/action'
import { unBeneficiaireWithActivity } from 'fixtures/beneficiaire'
import { desMotifsDeSuppression } from 'fixtures/referentiel'
import { getMotifsSuppression } from 'services/beneficiaires.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/evenements.service')
jest.mock('services/referentiel.service')
jest.mock('services/conseiller.service')
jest.mock('services/beneficiaires.service')
jest.mock('components/ModalContainer')

describe('PilotagePage client side - Archivage des bénéficiaires', () => {
  describe('contenu', () => {
    let container: HTMLElement
    const motifsSuppression = desMotifsDeSuppression()
    beforeEach(async () => {
      ;(getMotifsSuppression as jest.Mock).mockResolvedValue(motifsSuppression)
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
                  prenom: 'Ada',
                  nom: 'Lovelace',
                  estAArchiver: true,
                }),
                unBeneficiaireWithActivity({
                  id: 'a-archiver-2',
                  prenom: 'Grace',
                  nom: 'Hopper',
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
      expect(
        within(tableau).getByRole('button', { name: 'Archiver Lovelace Ada' })
      ).toBeInTheDocument()
      expect(
        within(tableau).getByRole('button', { name: 'Archiver Hopper Grace' })
      ).toBeInTheDocument()
    })

    it('permet d’archiver les bénéficiaires', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: 'Archiver Lovelace Ada' })
      )

      // Then
      expect(
        screen.getByText(
          'Souhaitez-vous supprimer le compte bénéficiaire : Ada Lovelace ?'
        )
      ).toBeInTheDocument()
    })
  })

  describe("quand le conseiller n'a pas de bénéficiaire à archiver", () => {
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
