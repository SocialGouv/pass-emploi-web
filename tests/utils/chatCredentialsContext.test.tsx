import { act, render, screen } from '@testing-library/react'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import { desItemsJeunes, extractBaseJeune, unJeuneChat } from 'fixtures/jeune'
import { JeuneChat } from 'interfaces/jeune'
import {
  getChatCredentials,
  observeConseillerChats,
  signIn,
} from 'services/messages.service'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { ChatsProvider } from 'utils/chat/chatsContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

jest.mock('services/messages.service')

describe('ChatCredentialsProvider', () => {
  beforeEach(async () => {
    // When
    ;(getChatCredentials as jest.Mock).mockResolvedValue({
      token: 'tokenFirebase',
      cleChiffrement: 'cleChiffrement',
    })
    ;(signIn as jest.Mock).mockResolvedValue({})

    // When
    await act(async () =>
      render(
        <ChatCredentialsProvider>
          <div />
        </ChatCredentialsProvider>
      )
    )
  })

  it('récupère les informations pour se connecter à la messagerie', async () => {
    // Then
    expect(getChatCredentials).toHaveBeenCalledWith()
  })

  it('se connecte à la messagerie', () => {
    // Then
    expect(signIn).toHaveBeenCalledWith('tokenFirebase')
  })
})
