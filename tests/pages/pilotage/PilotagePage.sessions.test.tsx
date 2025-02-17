import { act, screen, within } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useRouter } from 'next/navigation'

import Pilotage from 'app/(connected)/(with-sidebar)/(with-chat)/pilotage/PilotagePage'
import { desCategories } from 'fixtures/action'
import { uneListeDeSessionsAClore } from 'fixtures/session'
import { structureMilo } from 'interfaces/structure'
import { getSessionsACloreServerSide } from 'services/sessions.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/sessions.service')

describe('PilotagePage client side - Sessions', () => {
  describe('contenu', () => {
    let container: HTMLElement
    const sessions = uneListeDeSessionsAClore()
    beforeEach(async () => {
      ;(getSessionsACloreServerSide as jest.Mock).mockImplementation(
        async () => {}
      )
      ;(useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() })

      await act(async () => {
        ;({ container } = renderWithContexts(
          <Pilotage
            onglet='SESSIONS_IMILO'
            actions={{
              donnees: [],
              metadonnees: { nombrePages: 1, nombreTotal: 0 },
            }}
            categoriesActions={desCategories()}
            animationsCollectives={{
              donnees: [],
              metadonnees: { nombrePages: 1, nombreTotal: 0 },
            }}
            sessions={sessions}
          />,
          {
            customConseiller: {
              structure: structureMilo,
              agence: {
                nom: 'Mission Locale Aubenas',
                id: 'id-test',
              },
              structureMilo: {
                nom: 'Mission Locale Aubenas',
                id: 'id-test',
              },
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
      expect(getByDescriptionTerm('Sessions i-milo')).toHaveTextContent(
        '3 À clore'
      )
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Sessions i-milo 3 éléments'
      )
    })

    describe('sessions i-milo', () => {
      it('affiche un tableau de sessions à clore ', () => {
        // Given
        const tableau = screen.getByRole('table', {
          name: 'Liste des sessions i-milo à clore',
        })

        // Then
        expect(
          within(tableau).getByRole('columnheader', { name: 'Date' })
        ).toBeInTheDocument()
        expect(
          within(tableau).getByRole('columnheader', {
            name: 'Titre de la session',
          })
        ).toBeInTheDocument()
      })

      it('affiche les sessions i-milo de l’établissement à clore', async () => {
        // Given
        const tableau = screen.getByRole('table', {
          name: 'Liste des sessions i-milo à clore',
        })

        // Then
        const session1 = sessions[0]
        expect(
          within(tableau).getByRole('cell', { name: session1.date })
        ).toBeInTheDocument()
        expect(
          within(tableau).getByRole('cell', {
            name: session1.titre + ' ' + session1.sousTitre,
          })
        ).toBeInTheDocument()
        expect(
          within(tableau).getByRole('link', {
            name: 'Accéder au détail de la session du 05/05/2023 Session 1 sous-titre de session 1',
          })
        ).toHaveAttribute('href', '/agenda/sessions/' + session1.id)

        const session2 = sessions[1]
        expect(
          within(tableau).getByRole('cell', { name: session2.date })
        ).toBeInTheDocument()
        expect(
          within(tableau).getByRole('cell', {
            name: session2.titre + ' ' + session2.sousTitre,
          })
        ).toBeInTheDocument()
        expect(
          within(tableau).getByRole('link', {
            name: 'Accéder au détail de la session du 06/05/2023 Session 2 sous-titre de session 2',
          })
        ).toHaveAttribute('href', '/agenda/sessions/' + session2.id)

        const session3 = sessions[2]
        expect(
          within(tableau).getByRole('cell', { name: session3.date })
        ).toBeInTheDocument()
        expect(
          within(tableau).getByRole('cell', {
            name: session3.titre + ' ' + session3.sousTitre,
          })
        ).toBeInTheDocument()
        expect(
          within(tableau).getByRole('link', {
            name: 'Accéder au détail de la session du 07/05/2023 Session 3 sous-titre de session 3',
          })
        ).toHaveAttribute('href', '/agenda/sessions/' + session3.id)
      })
    })
  })

  describe("quand le conseiller n'a pas de session à clore", () => {
    it('affiche un message qui le précise', async () => {
      // Given
      ;(useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() })
      renderWithContexts(
        <Pilotage
          onglet='SESSIONS_IMILO'
          actions={{
            donnees: [],
            metadonnees: { nombrePages: 0, nombreTotal: 0 },
          }}
          categoriesActions={desCategories()}
          animationsCollectives={{
            donnees: [],
            metadonnees: { nombrePages: 0, nombreTotal: 0 },
          }}
          sessions={[]}
        />,
        {
          customConseiller: {
            structure: structureMilo,
            agence: {
              nom: 'Mission Locale Aubenas',
              id: 'id-test',
            },
            structureMilo: {
              nom: 'Mission Locale Aubenas',
              id: 'id-test',
            },
          },
        }
      )

      // Then
      expect(
        screen.getByText('Vous n’avez pas de session à clore.')
      ).toBeInTheDocument()
    })
  })
})
