import { act, screen } from '@testing-library/react'
import React from 'react'

import DisplayMessageBeneficiaire from 'components/chat/DisplayMessageBeneficiaire'
import { unMessage } from 'fixtures/message'
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
})
