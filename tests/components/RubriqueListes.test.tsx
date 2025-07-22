import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import RubriqueListes from 'components/chat/RubriqueListes'
import { desListes } from 'fixtures/listes'
import { Liste } from 'interfaces/liste'
import { getMessagesListe } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/messages.service')

describe('<RubriqueListes />', () => {
  let listes: Liste[]

  describe('quand le conseiller a des listes', () => {
    beforeEach(async () => {
      // Given
      ;(getMessagesListe as jest.Mock).mockResolvedValue({
        countMessagesFetched: 0,
        days: [],
      })
      listes = desListes()

      // When
      await renderWithContexts(
        <RubriqueListes listes={listes} onBack={() => {}} chats={[]} />,
        {}
      )
    })

    it('affiche les listes', async () => {
      // Then
      expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName(
        'Mes listes'
      )
      const listesHTML = screen.getByRole('list', {
        description: 'Listes (2)',
      })
      expect(within(listesHTML).getAllByRole('listitem')).toHaveLength(
        listes.length
      )
      listes.forEach((liste) => {
        const titreListe = within(listesHTML).getByRole('heading', {
          level: 4,
          name: new RegExp(liste.titre),
        })

        expect(titreListe).toBeInTheDocument()
        expect(titreListe.nextElementSibling).toHaveTextContent(
          liste.beneficiaires.length + ' destinataire(s)'
        )
      })
    })

    it('prévient quand une liste contient un bénéficiaire transféré temporairement', async () => {
      // Then
      expect(
        screen.getByRole('heading', {
          level: 4,
          name:
            'Un ou plusieurs bénéficiaires de cette liste ont été réaffectés temporairement. ' +
            listes[1].titre,
        })
      ).toBeInTheDocument()
    })

    it('permet d’accéder aux messages d’une liste', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: new RegExp(listes[0].titre),
        })
      )
      // Then
      expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName(
        listes[0].titre
      )

      // When
      await userEvent.click(screen.getByRole('button', { name: /Retour/ }))
      // Then
      expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName(
        'Mes listes'
      )
    })
  })

  describe('quand le conseiller n‘a pas de liste', () => {
    it('prévient le conseiller qu’il n’a pas de liste', async () => {
      // When
      await renderWithContexts(
        <RubriqueListes listes={[]} onBack={() => {}} chats={[]} />
      )

      // Then
      expect(
        screen.getByText('Vous n’avez pas encore créé de liste.')
      ).toBeInTheDocument()
    })
  })
})
