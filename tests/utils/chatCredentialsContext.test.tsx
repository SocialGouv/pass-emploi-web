import { act, render } from '@testing-library/react'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import { StructureConseiller } from 'interfaces/conseiller'
import { getChatCredentials, signIn } from 'services/messages.service'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'

jest.mock('services/messages.service')

describe('ChatCredentialsProvider', () => {
  beforeEach(async () => {
    // When
    ;(getChatCredentials as jest.Mock).mockResolvedValue({
      token: 'tokenFirebase',
      cleChiffrement: 'cleChiffrement',
    })
    ;(signIn as jest.Mock).mockResolvedValue({})
  })

  it('se connecte à la messagerie', async () => {
    // When
    await act(async () =>
      render(
        <ConseillerProvider conseiller={unConseiller()}>
          <ChatCredentialsProvider>
            <div />
          </ChatCredentialsProvider>
        </ConseillerProvider>
      )
    )

    // Then
    expect(getChatCredentials).toHaveBeenCalledWith()
    expect(signIn).toHaveBeenCalledWith('tokenFirebase')
  })

  it('n’utilise pas la messagerie si CVM est activé', async () => {
    // Given
    process.env.NEXT_PUBLIC_ENABLE_CVM = 'true'

    // When
    await act(async () =>
      render(
        <ConseillerProvider
          conseiller={unConseiller({
            structure: StructureConseiller.POLE_EMPLOI,
          })}
        >
          <ChatCredentialsProvider>
            <div />
          </ChatCredentialsProvider>
        </ConseillerProvider>
      )
    )

    // Then
    expect(getChatCredentials).not.toHaveBeenCalled()
    expect(signIn).not.toHaveBeenCalled()
  })

  it('n’utilise pas la messagerie si le conseiller est un early adopter CVM', async () => {
    // Given
    process.env.NEXT_PUBLIC_CVM_EARLY_ADOPTERS = 'id1,id2,id-early-adopter'

    // When
    await act(async () =>
      render(
        <ConseillerProvider
          conseiller={unConseiller({
            id: 'id-early-adopter',
            structure: StructureConseiller.POLE_EMPLOI,
          })}
        >
          <ChatCredentialsProvider>
            <div />
          </ChatCredentialsProvider>
        </ConseillerProvider>
      )
    )

    // Then
    expect(getChatCredentials).not.toHaveBeenCalled()
    expect(signIn).not.toHaveBeenCalled()
  })
})
