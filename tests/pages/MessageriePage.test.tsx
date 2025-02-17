import { act, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import React from 'react'

import MessageriePage from 'app/(connected)/(with-sidebar)/messagerie/MessageriePage'
import {
  desItemsBeneficiaires,
  unBeneficiaireChat,
} from 'fixtures/beneficiaire'
import { desListesDeDiffusion } from 'fixtures/listes-de-diffusion'
import { desMessagesListeDeDiffusionParJour } from 'fixtures/message'
import {
  BaseBeneficiaire,
  BeneficiaireEtChat,
  extractBaseBeneficiaire,
} from 'interfaces/beneficiaire'
import { ByDay, MessageListeDiffusion } from 'interfaces/message'
import { structureFTCej } from 'interfaces/structure'
import { getListesDeDiffusionClientSide } from 'services/listes-de-diffusion.service'
import {
  getMessagesListeDeDiffusion,
  observeConseillerChats,
} from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/messages.service')
jest.mock('services/listes-de-diffusion.service')

describe('MessageriePage client side', () => {
  let container: HTMLElement
  const jeunes: BaseBeneficiaire[] = desItemsBeneficiaires().map(
    extractBaseBeneficiaire
  )
  let beneficiairesChats: BeneficiaireEtChat[]

  let updateChatsRef: (chats: BeneficiaireEtChat[]) => void
  let messages: ByDay<MessageListeDiffusion>

  beforeEach(async () => {
    messages = desMessagesListeDeDiffusionParJour()
    ;(observeConseillerChats as jest.Mock).mockImplementation(
      (_jeune, _cle, fn) => {
        updateChatsRef = fn
        updateChatsRef(beneficiairesChats)
        return Promise.resolve(() => {})
      }
    )
    ;(getMessagesListeDeDiffusion as jest.Mock).mockResolvedValue(messages)
    ;(getListesDeDiffusionClientSide as jest.Mock).mockResolvedValue(
      desListesDeDiffusion()
    )
    beneficiairesChats = [
      unBeneficiaireChat({
        ...jeunes[0],
        chatId: `chat-${jeunes[0].id}`,
        seenByConseiller: true,
      }),
      unBeneficiaireChat({
        ...jeunes[1],
        chatId: `chat-${jeunes[1].id}`,
        seenByConseiller: true,
      }),
      unBeneficiaireChat({
        ...jeunes[2],
        chatId: `chat-${jeunes[2].id}`,
        seenByConseiller: false,
      }),
    ]
  })

  describe('tunnel de messagerie', () => {
    beforeEach(async () => {
      //When
      ;({ container } = renderWithContexts(<MessageriePage />, {
        customConseiller: {
          structure: structureFTCej,
        },
      }))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('affiche un message de bienvenue au landing sur la page', async () => {
      //Then
      expect(
        screen.getByText('Bienvenue dans votre espace de messagerie.')
      ).toBeInTheDocument()
    })
  })

  describe('tunnel des listes de diffusion', () => {
    describe('conseille à l’utilisateur de sélectionner une liste de diffusion au clic sur ”voir mes listes de diffusion”', () => {
      beforeEach(async () => {
        //When
        await act(async () => {
          ;({ container } = renderWithContexts(<MessageriePage />, {
            customConseiller: {
              structure: structureFTCej,
            },
            customShowRubriqueListeDeDiffusion: { value: true },
          }))
        })
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })
      it('contenu', async () => {
        //Then
        expect(
          screen.getByText('Veuillez sélectionner une liste de diffusion.')
        ).toBeInTheDocument()
      })
    })

    describe('quand une liste est sélectionée', () => {
      beforeEach(async () => {
        //Given
        const listeSelectionnee = desListesDeDiffusion()[0]

        //When
        await act(async () => {
          ;({ container } = renderWithContexts(<MessageriePage />, {
            customConseiller: {
              structure: structureFTCej,
            },
            customShowRubriqueListeDeDiffusion: { value: true },
            customListeDeDiffusionSelectionnee: {
              value: { liste: listeSelectionnee },
            },
          }))
        })
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })
      it('affiche le lien vers la page de modification de la liste si une liste est sélectionnée', async () => {
        expect(
          screen.getByRole('link', {
            name: 'Modifier ma liste',
          })
        ).toBeInTheDocument()
      })
      it('affiche les messages de la liste de diffusion', async () => {
        const messageRandom =
          desMessagesListeDeDiffusionParJour().days[0].messages[0]
        //Then
        expect(
          screen.getByText('Messages envoyés à la liste de diffusion')
        ).toBeInTheDocument()

        expect(screen.getByText(messageRandom.content)).toBeInTheDocument()
      })
    })
  })
})
