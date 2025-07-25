import { screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import React from 'react'
import { getListesClientSide } from 'services/listes.service'

import MessageriePage from 'app/(connected)/(with-sidebar)/messagerie/MessageriePage'
import {
  desItemsBeneficiaires,
  unBeneficiaireChat,
} from 'fixtures/beneficiaire'
import { desListes } from 'fixtures/listes'
import { desMessagesListeParJour } from 'fixtures/message'
import {
  BeneficiaireEtChat,
  extractBaseBeneficiaire,
  IdentiteBeneficiaire,
} from 'interfaces/beneficiaire'
import { ByDay, MessageListe } from 'interfaces/message'
import { structureFTCej } from 'interfaces/structure'
import {
  getMessagesListe,
  observeConseillerChats,
} from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/messages.service')
jest.mock('services/listes.service')

describe('MessageriePage client side', () => {
  let container: HTMLElement
  const jeunes: IdentiteBeneficiaire[] = desItemsBeneficiaires().map(
    extractBaseBeneficiaire
  )
  let beneficiairesChats: BeneficiaireEtChat[]

  let updateChatsRef: (chats: BeneficiaireEtChat[]) => void
  let messages: ByDay<MessageListe>

  beforeEach(async () => {
    messages = desMessagesListeParJour()
    ;(observeConseillerChats as jest.Mock).mockImplementation(
      (_jeune, _cle, fn) => {
        updateChatsRef = fn
        updateChatsRef(beneficiairesChats)
        return Promise.resolve(() => {})
      }
    )
    ;(getMessagesListe as jest.Mock).mockResolvedValue(messages)
    ;(getListesClientSide as jest.Mock).mockResolvedValue(desListes())
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
      ;({ container } = await renderWithContexts(<MessageriePage />, {
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

  describe('tunnel des listes', () => {
    describe('conseille à l’utilisateur de sélectionner une liste au clic sur ”voir mes listes”', () => {
      beforeEach(async () => {
        //When
        ;({ container } = await renderWithContexts(<MessageriePage />, {
          customConseiller: {
            structure: structureFTCej,
          },
          customShowRubriqueListe: { value: true },
        }))
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })
      it('contenu', async () => {
        //Then
        expect(
          screen.getByText('Veuillez sélectionner une liste.')
        ).toBeInTheDocument()
      })
    })

    describe('quand une liste est sélectionée', () => {
      beforeEach(async () => {
        //Given
        const listeSelectionnee = desListes()[0]

        //When
        ;({ container } = await renderWithContexts(<MessageriePage />, {
          customConseiller: {
            structure: structureFTCej,
          },
          customShowRubriqueListe: { value: true },
          customListeSelectionnee: {
            value: { liste: listeSelectionnee },
          },
        }))
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
      it('affiche les messages de la liste', async () => {
        const messageRandom = desMessagesListeParJour().days[0].messages[0]
        //Then
        expect(
          screen.getByText('Messages envoyés à la liste')
        ).toBeInTheDocument()

        expect(screen.getByText(messageRandom.content)).toBeInTheDocument()
      })
    })
  })
})
