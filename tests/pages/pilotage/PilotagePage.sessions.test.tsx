import { act, screen, within } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useRouter } from 'next/navigation'
import React from 'react'

import Pilotage from 'app/(connected)/(with-sidebar)/(with-chat)/pilotage/PilotagePage'
import { desCategories } from 'fixtures/action'
import { uneListeDeSessionsAClore } from 'fixtures/session'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  getSessionsACloreServerSide,
  SessionsAClore,
} from 'services/sessions.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/sessions.service')

describe('PilotagePage client side - Sessions', () => {
  describe('contenu', () => {
    let container: HTMLElement
    let sessions: SessionsAClore[]

    beforeEach(async () => {
      sessions = uneListeDeSessionsAClore()
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
              structure: StructureConseiller.MILO,
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

      expect(results).toHaveNoViolations()
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
        sessions.forEach((session) => {
          expect(within(tableau).getByText(session.date)).toBeInTheDocument()
          expect(within(tableau).getByText(session.titre)).toBeInTheDocument()
          expect(
            within(tableau).getByRole('link', {
              name: `Accéder au détail de la session : ${session.titre}`,
            })
          ).toHaveAttribute('href', '/agenda/sessions/' + session.id)
        })
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
            structure: StructureConseiller.MILO,
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
