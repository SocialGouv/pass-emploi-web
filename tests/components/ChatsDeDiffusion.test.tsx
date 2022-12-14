import { render, screen, within } from '@testing-library/react'
import React from 'react'

import ChatsDeDiffusion from 'components/chat/ChatsDeDiffusion'
import { desListesDeDiffusion } from 'fixtures/listes-de-diffusion'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'

describe('<ChatsDeDiffusion />', () => {
  let listesDeDiffusion: ListeDeDiffusion[]

  describe('quand le conseiller a des listes de diffusion', () => {
    beforeEach(async () => {
      // Given
      listesDeDiffusion = desListesDeDiffusion()

      // When
      render(
        <ChatsDeDiffusion
          listesDeDiffusion={listesDeDiffusion}
          onBack={() => {}}
        />
      )
    })

    it('affiche les listes de diffusion', async () => {
      // Then
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
      )
    })
  })

  describe('quand le conseiller n‘a pas de liste de diffusion', () => {
    // When
    render(<ChatsDeDiffusion listesDeDiffusion={[]} onBack={() => {}} />)

    // Then
    expect(
      screen.getByText('Vous n’avez pas encore créé de liste de diffusion')
    ).toBeInTheDocument()
  })
})
