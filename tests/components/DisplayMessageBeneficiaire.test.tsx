import { act, screen } from '@testing-library/react'
import React from 'react'

import DisplayMessageBeneficiaire from 'components/chat/DisplayMessageBeneficiaire'
import { unMessage } from 'fixtures/message'
import { TypeMessage } from 'interfaces/message'
import renderWithContexts from 'tests/renderWithContexts'

describe('<DiplayMessageBeneficiaire />', () => {
  it('affiche un message envoyé par le bénéficiaire', async () => {
    const beneficiaireNomComplet = 'Père Castor'

    //Given
    const message = unMessage({
      sentBy: 'jeune',
      content: 'Je vais vous raconter une histoire',
    })

    //When
    await act(async () => {
      renderWithContexts(
        <DisplayMessageBeneficiaire
          message={message}
          beneficiaireNomComplet={beneficiaireNomComplet}
        />
      )
    })

    // Then
    expect(screen.getByText('Père Castor :')).toBeInTheDocument()
  })

  it('affiche un message supprimé par le bénéficiaire', async () => {
    const beneficiaireNomComplet = 'Père Castor'

    //Given
    const message = unMessage({
      sentBy: 'jeune',
      content: 'Rdv demain 10h',
      status: 'deleted',
    })

    //When
    await act(async () => {
      renderWithContexts(
        <DisplayMessageBeneficiaire
          message={message}
          beneficiaireNomComplet={beneficiaireNomComplet}
        />
      )
    })

    // Then
    expect(screen.getByText('Message supprimé')).toBeInTheDocument()
    expect(() => screen.getByText(message.content)).toThrow()
  })

  it('affiche un message modifié par le bénéficiaire', async () => {
    const beneficiaireNomComplet = 'Père Castor'

    //Given
    const message = unMessage({
      sentBy: 'jeune',
      content: 'Rdv demain 10h',
      status: 'edited',
    })

    //When
    await act(async () => {
      renderWithContexts(
        <DisplayMessageBeneficiaire
          message={message}
          beneficiaireNomComplet={beneficiaireNomComplet}
        />
      )
    })

    // Then
    expect(screen.getByText(/Modifié/)).toBeInTheDocument()
  })

  describe('quand il y a une pièce jointe', () => {
    it('pas de statut', async () => {
      const beneficiaireNomComplet = 'Père Castor'

      //Given
      const message = unMessage({
        sentBy: 'jeune',
        content: 'Rdv demain 10h',
        infoPiecesJointes: [
          {
            id: 'id-pj',
            nom: 'piece-jointe.jpg',
          },
        ],
        type: TypeMessage.MESSAGE_PJ,
      })

      //When
      await act(async () => {
        renderWithContexts(
          <DisplayMessageBeneficiaire
            message={message}
            beneficiaireNomComplet={beneficiaireNomComplet}
          />
        )
      })

      // Then
      expect(() => screen.getByText('piece-jointe.jpg')).toThrow()
    })

    it('statut analyse_a_faire', async () => {
      const beneficiaireNomComplet = 'Père Castor'

      //Given
      const message = unMessage({
        sentBy: 'jeune',
        content: 'Rdv demain 10h',
        infoPiecesJointes: [
          {
            id: 'id-pj',
            nom: 'piece-jointe.jpg',
            statut: 'analyse_a_faire',
          },
        ],
        type: TypeMessage.MESSAGE_PJ,
      })

      //When
      await act(async () => {
        renderWithContexts(
          <DisplayMessageBeneficiaire
            message={message}
            beneficiaireNomComplet={beneficiaireNomComplet}
          />
        )
      })

      // Then
      expect(
        screen.getByText(message.infoPiecesJointes[0].nom)
      ).toBeInTheDocument()
      expect(() =>
        screen.getByRole('link', { name: message.infoPiecesJointes[0].nom })
      ).toThrow()
    })

    it('statut analyse_en_cours', async () => {
      const beneficiaireNomComplet = 'Père Castor'

      //Given
      const message = unMessage({
        sentBy: 'jeune',
        content: 'Rdv demain 10h',
        infoPiecesJointes: [
          {
            id: 'id-pj',
            nom: 'piece-jointe.jpg',
            statut: 'analyse_en_cours',
          },
        ],
        type: TypeMessage.MESSAGE_PJ,
      })

      //When
      await act(async () => {
        renderWithContexts(
          <DisplayMessageBeneficiaire
            message={message}
            beneficiaireNomComplet={beneficiaireNomComplet}
          />
        )
      })

      // Then
      expect(
        screen.getByText(message.infoPiecesJointes[0].nom)
      ).toBeInTheDocument()
      expect(() =>
        screen.getByRole('link', { name: message.infoPiecesJointes[0].nom })
      ).toThrow()
    })

    it('statut valide', async () => {
      const beneficiaireNomComplet = 'Père Castor'

      //Given
      const message = unMessage({
        sentBy: 'jeune',
        content: 'Rdv demain 10h',
        infoPiecesJointes: [
          {
            id: 'id-pj',
            nom: 'piece-jointe.jpg',
            statut: 'valide',
          },
        ],
        type: TypeMessage.MESSAGE_PJ,
      })

      //When
      await act(async () => {
        renderWithContexts(
          <DisplayMessageBeneficiaire
            message={message}
            beneficiaireNomComplet={beneficiaireNomComplet}
          />
        )
      })

      // Then
      expect(
        screen.getByRole('link', {
          name:
            'Télécharger la pièce jointe ' + message.infoPiecesJointes[0].nom,
        })
      ).toBeInTheDocument()
    })

    it('statut expirée', async () => {
      const beneficiaireNomComplet = 'Père Castor'

      //Given
      const message = unMessage({
        sentBy: 'jeune',
        content: 'Rdv demain 10h',
        infoPiecesJointes: [
          {
            id: 'id-pj',
            nom: 'piece-jointe.jpg',
            statut: 'expiree',
          },
        ],
        type: TypeMessage.MESSAGE_PJ,
      })

      //When
      await act(async () => {
        renderWithContexts(
          <DisplayMessageBeneficiaire
            message={message}
            beneficiaireNomComplet={beneficiaireNomComplet}
          />
        )
      })

      // Then
      expect(screen.getByText('Pièce jointe expirée')).toBeInTheDocument()
    })
  })
})
