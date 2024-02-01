import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { desCategories } from 'fixtures/action'
import { useRouter } from 'next/router'
import React from 'react'

import { uneListeDeSessionsAClore } from 'fixtures/session'
import { StructureConseiller } from 'interfaces/conseiller'
import Pilotage from 'pages/pilotage'
import {
  getSessionsACloreServerSide,
  SessionsAClore,
} from 'services/sessions.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/sessions.service')

describe('PilotagePage client side - Sessions', () => {
  describe('contenu', () => {
    let sessions: SessionsAClore[]

    beforeEach(async () => {
      sessions = uneListeDeSessionsAClore()
      ;(getSessionsACloreServerSide as jest.Mock).mockImplementation(
        async () => {}
      )
      ;(useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() })

      await act(async () =>
        renderWithContexts(
          <Pilotage
            pageTitle=''
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
        )
      )
      await userEvent.click(
        screen.getByRole('tab', { name: 'Sessions i-milo 3' })
      )
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
        'Sessions i-milo 3'
      )
    })

    describe('sessions i-milo', () => {
      beforeEach(async () => {
        // Given
        await userEvent.click(
          screen.getByRole('tab', { name: 'Sessions i-milo 3' })
        )
      })

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
            within(tableau).getByLabelText(
              `Accéder au détail de la session : ${session.titre}`
            )
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
          withoutChat={true}
          pageTitle=''
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

      // When
      await userEvent.click(
        screen.getByRole('tab', { name: /Sessions i-milo/ })
      )

      // Then
      expect(
        screen.getByText('Vous n’avez pas de session à clore.')
      ).toBeInTheDocument()
    })
  })
})
