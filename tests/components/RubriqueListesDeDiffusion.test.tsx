import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import RubriqueListesDeDiffusion from 'components/chat/RubriqueListesDeDiffusion'
import { desListesDeDiffusion } from 'fixtures/listes-de-diffusion'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { getMessagesListeDeDiffusion } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/messages.service')

describe('<RubriqueListesDeDiffusion />', () => {
  let listesDeDiffusion: ListeDeDiffusion[]

  describe('quand le conseiller a des listes de diffusion', () => {
    beforeEach(async () => {
      // Given
      ;(getMessagesListeDeDiffusion as jest.Mock).mockResolvedValue({
        countMessagesFetched: 0,
        days: [],
      })
      listesDeDiffusion = desListesDeDiffusion()

      // When
      await renderWithContexts(
        <RubriqueListesDeDiffusion
          listesDeDiffusion={listesDeDiffusion}
          onBack={() => {}}
          chats={[]}
        />,
        {}
      )
    })

    it('affiche les listes de diffusion', async () => {
      // Then
      expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName(
        'Mes listes de diffusion'
      )
      const listes = screen.getByRole('list', {
        description: 'Listes (2)',
      })
      expect(within(listes).getAllByRole('listitem')).toHaveLength(
        listesDeDiffusion.length
      )
      listesDeDiffusion.forEach((liste) => {
        const titreListe = within(listes).getByRole('heading', {
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
            listesDeDiffusion[1].titre,
        })
      ).toBeInTheDocument()
    })

    it('permet d’accéder aux messages d’une liste', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: new RegExp(listesDeDiffusion[0].titre),
        })
      )
      // Then
      expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName(
        listesDeDiffusion[0].titre
      )

      // When
      await userEvent.click(screen.getByRole('button', { name: /Retour/ }))
      // Then
      expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName(
        'Mes listes de diffusion'
      )
    })
  })

  describe('quand le conseiller n‘a pas de liste de diffusion', () => {
    it('prévient le conseiller qu’il n’a pas de liste', async () => {
      // When
      await renderWithContexts(
        <RubriqueListesDeDiffusion
          listesDeDiffusion={[]}
          onBack={() => {}}
          chats={[]}
        />
      )

      // Then
      expect(
        screen.getByText('Vous n’avez pas encore créé de liste de diffusion.')
      ).toBeInTheDocument()
    })
  })
})
