import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'
import React from 'react'

import ChatRoom from 'components/chat/ChatRoom'
import AlerteDisplayer from 'components/layouts/AlerteDisplayer'
import {
  desItemsBeneficiaires,
  unBeneficiaireChat,
} from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import {
  BeneficiaireEtChat,
  extractBaseBeneficiaire,
  IdentiteBeneficiaire,
} from 'interfaces/beneficiaire'
import {
  desactiverMessageImportant,
  getMessageImportant,
  sendNouveauMessageImportant,
  toggleFlag,
} from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/messages.service')
jest.mock('components/layouts/AlerteDisplayer', () => jest.fn(() => <></>))
jest.mock('components/ModalContainer')

describe('<ChatRoom />', () => {
  const beneficiaires: IdentiteBeneficiaire[] = desItemsBeneficiaires().map(
    extractBaseBeneficiaire
  )
  let beneficiairesChats: BeneficiaireEtChat[]

  beforeEach(async () => {
    beneficiairesChats = [
      unBeneficiaireChat({
        ...beneficiaires[0],
        chatId: `chat-${beneficiaires[0].id}`,
        seenByConseiller: true,
      }),
      unBeneficiaireChat({
        ...beneficiaires[1],
        chatId: `chat-${beneficiaires[1].id}`,
        seenByConseiller: true,
      }),
      unBeneficiaireChat({
        ...beneficiaires[2],
        chatId: `chat-${beneficiaires[2].id}`,
        seenByConseiller: false,
      }),
    ]
  })

  describe('quand le conseiller veut configurer un message important', () => {
    let accederConversation: (conversation: BeneficiaireEtChat) => void
    beforeEach(async () => {
      accederConversation = jest.fn()
    })

    it('n’affiche pas de pastille s’il n’y a pas de message configuré', async () => {
      //Given
      ;(getMessageImportant as jest.Mock).mockResolvedValue(undefined)

      //When
      const { container } = await renderWithContexts(
        <ChatRoom
          beneficiairesChats={beneficiairesChats}
          onAccesConversation={accederConversation}
          onAccesListes={() => {}}
          onOuvertureMenu={() => {}}
        />,
        {
          customConseiller: unConseiller({ id: 'id-conseiller-1' }),
        }
      )

      await userEvent.click(
        screen.getByRole('button', {
          name: 'Accéder aux actions de votre messagerie',
        })
      )

      //Then
      const result = await axe(container)
      expect(result).toHaveNoViolations()
      expect(() =>
        screen.getByText('Un message important est déjà configuré')
      ).toThrow()
    })

    describe('quand un message important existe', () => {
      it('affiche une pastille si un message est configuré', async () => {
        //Given
        ;(getMessageImportant as jest.Mock).mockResolvedValue({
          message: 'contenu du message',
          dateDebut: DateTime.now().toISODate(),
          dateFin: DateTime.now().plus({ day: 1 }).toISODate(),
          id: 'id-message',
        })

        await renderWithContexts(
          <ChatRoom
            beneficiairesChats={beneficiairesChats}
            onAccesConversation={accederConversation}
            onAccesListes={() => {}}
            onOuvertureMenu={() => {}}
          />,
          {
            customConseiller: unConseiller({ id: 'id-conseiller-1' }),
          }
        )

        await userEvent.click(
          screen.getByRole('button', {
            name: 'Accéder aux actions de votre messagerie',
          })
        )

        //Then
        expect(
          screen.getByText('Un message important est déjà configuré')
        ).toBeInTheDocument()
      })

      it('affiche un bouton pour configurer son message', async () => {
        //When
        await renderWithContexts(
          <ChatRoom
            beneficiairesChats={beneficiairesChats}
            onAccesConversation={accederConversation}
            onAccesListes={() => {}}
            onOuvertureMenu={() => {}}
          />,
          {
            customConseiller: unConseiller({ id: 'id-conseiller-1' }),
          }
        )

        await userEvent.click(
          screen.getByRole('button', {
            name: 'Accéder aux actions de votre messagerie',
          })
        )

        //Then
        expect(
          screen.getByRole('button', {
            name: /Configurer un message important/,
          })
        ).toBeInTheDocument()
      })

      describe('quand le conseiller clique sur le bouton', () => {
        describe('quand le conseiller veut créer un nouveau message important', () => {
          let inputDateDebut: HTMLInputElement
          let inputDateFin: HTMLInputElement
          let inputMessage: HTMLTextAreaElement
          let submitBtn: HTMLButtonElement

          beforeEach(async () => {
            //Given
            ;(getMessageImportant as jest.Mock).mockResolvedValue({
              undefined,
            })

            await renderWithContexts(
              <ChatRoom
                beneficiairesChats={beneficiairesChats}
                onAccesConversation={accederConversation}
                onAccesListes={() => {}}
                onOuvertureMenu={() => {}}
              />,
              {
                customConseiller: unConseiller({ id: 'id-conseiller-1' }),
              }
            )

            await userEvent.click(
              screen.getByRole('button', {
                name: 'Accéder aux actions de votre messagerie',
              })
            )

            const now = DateTime.fromISO('2024-04-24')
            jest.spyOn(DateTime, 'now').mockReturnValue(now)

            const boutonSettings = screen.getByRole('button', {
              name: 'Configurer un message important',
            })

            await userEvent.click(boutonSettings)
            inputDateDebut = screen.getByLabelText(
              'Date de début format : jj/mm/aaaa'
            )
            inputDateFin = screen.getByLabelText(
              'Date de fin format : jj/mm/aaaa'
            )
            inputMessage = screen.getByLabelText(/Message/)
            submitBtn = screen.getByRole('button', { name: 'Envoyer' })
          })

          it('permet de remplir un formulaire pour ajouter un message important', async () => {
            //Given
            const messageImportant =
              'Actuellement en congés, je ne peux pas vous répondre.'

            //When
            await userEvent.type(inputDateDebut, '2024-04-24')
            await userEvent.type(inputDateFin, '2024-04-30')
            await userEvent.type(inputMessage, messageImportant)
            await userEvent.click(submitBtn)

            //Then
            expect(sendNouveauMessageImportant).toHaveBeenCalledWith({
              cleChiffrement: 'cleChiffrement',
              dateDebut: DateTime.fromISO('2024-04-24'),
              dateFin: DateTime.fromISO('2024-04-30'),
              idConseiller: 'id-conseiller-1',
              newMessage: messageImportant,
            })
          })

          describe('gère les messages d’erreur', () => {
            it('quand les champs sont vides', async () => {
              //When
              await userEvent.click(inputDateDebut)
              await userEvent.click(inputDateFin)
              await userEvent.click(inputMessage)
              await userEvent.click(submitBtn)

              //Then
              expect(
                screen.getByText(
                  'Le champ “Date de début” est vide. Renseignez une date de début.'
                )
              ).toBeInTheDocument()
              expect(
                screen.getByText(
                  'Le champ “Date de fin” est vide. Renseignez une date de fin.'
                )
              ).toBeInTheDocument()
              expect(
                screen.getByText(
                  'Le champ “Message” est vide. Renseignez un message.'
                )
              ).toBeInTheDocument()
            })
          })
        })

        describe('quand le conseiller veut mettre à jour son message important', () => {
          it('pré-remplit le formulaire', async () => {
            //Given
            ;(getMessageImportant as jest.Mock).mockResolvedValue({
              message: 'contenu-message',
              dateDebut: '2024-04-24',
              dateFin: '2024-04-25',
              id: 'id-document',
            })

            //When
            await renderWithContexts(
              <ChatRoom
                beneficiairesChats={beneficiairesChats}
                onAccesConversation={accederConversation}
                onAccesListes={() => {}}
                onOuvertureMenu={() => {}}
              />,
              {
                customConseiller: unConseiller({ id: 'id-conseiller-1' }),
              }
            )

            await userEvent.click(
              screen.getByRole('button', {
                name: 'Accéder aux actions de votre messagerie',
              })
            )

            const boutonSettings = screen.getByRole('button', {
              name: 'Configurer un message important',
            })

            await userEvent.click(boutonSettings)

            const inputDateDebut = screen.getByLabelText(
              'Date de début format : jj/mm/aaaa'
            )
            const inputDateFin = screen.getByLabelText(
              'Date de fin format : jj/mm/aaaa'
            )
            const inputMessage = screen.getByLabelText(/Message/)

            //Then
            expect(inputDateDebut).toHaveProperty('defaultValue', '2024-04-24')
            expect(inputDateFin).toHaveProperty('defaultValue', '2024-04-25')
            expect(inputMessage).toHaveProperty('value', 'contenu-message')
          })
        })
      })

      it('permet de supprimer le message important', async () => {
        //Given
        ;(getMessageImportant as jest.Mock).mockResolvedValue({
          message: 'contenu-message',
          dateDebut: '2024-04-24',
          dateFin: '2024-05-25',
          id: 'id-document',
        })

        const now = DateTime.fromISO('2024-04-24')
        jest.spyOn(DateTime, 'now').mockReturnValue(now)

        await renderWithContexts(
          <ChatRoom
            beneficiairesChats={beneficiairesChats}
            onAccesConversation={accederConversation}
            onAccesListes={() => {}}
            onOuvertureMenu={() => {}}
          />,
          {
            customConseiller: unConseiller({ id: 'id-conseiller-1' }),
          }
        )

        await userEvent.click(
          screen.getByRole('button', {
            name: 'Accéder aux actions de votre messagerie',
          })
        )

        const boutonSettings = screen.getByRole('button', {
          name: /Configurer un message important/,
        })

        await userEvent.click(boutonSettings)

        const supprimerMessage = screen.getByRole('button', {
          name: 'Désactiver le message',
        })

        //When
        await userEvent.click(supprimerMessage)

        //Then
        expect(desactiverMessageImportant).toHaveBeenCalledWith('id-document')
      })
    })
  })

  describe('quand le conseiller a des beneficiaires', () => {
    let accederConversation: (conversation: BeneficiaireEtChat) => void
    let container: HTMLElement
    beforeEach(async () => {
      ;(getMessageImportant as jest.Mock).mockResolvedValue(undefined)
      accederConversation = jest.fn()
      ;({ container } = await renderWithContexts(
        <ChatRoom
          beneficiairesChats={beneficiairesChats}
          onAccesConversation={accederConversation}
          onAccesListes={() => {}}
          onOuvertureMenu={() => {}}
        />
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('affiche les alertes sur petit écran', () => {
      expect(AlerteDisplayer).toHaveBeenCalledWith(
        { hideOnLargeScreen: true },
        undefined
      )
    })

    it('devrait avoir le lien message multidestinataires', () => {
      // Then
      expect(
        screen.getByRole('link', { name: 'Message multi-destinataires' })
      ).toBeInTheDocument()
    })

    describe('pour chaque bénéficiaire', () => {
      const cases = beneficiaires.map((beneficiaire) => [beneficiaire])
      it.each(cases)('affiche le chat de %j', (beneficiaire) => {
        // Then
        expect(
          screen.getByText(`${beneficiaire.prenom} ${beneficiaire.nom}`)
        ).toBeInTheDocument()
      })
    })

    describe('quand on sélectionne un beneficiaire', () => {
      it('affiche la conversation du beneficiaire', async () => {
        const beneficiaireSelectionne = beneficiaires[0]
        // Given
        const goToConversation = screen
          .getByText(
            `${beneficiaireSelectionne.prenom} ${beneficiaireSelectionne.nom}`
          )
          .closest('button')

        // When
        await userEvent.click(goToConversation!)

        // Then
        expect(accederConversation).toHaveBeenCalledTimes(1)
        expect(accederConversation).toHaveBeenCalledWith(beneficiairesChats[0])
      })
    })

    describe("quand on clique sur le flag d'une conversation", () => {
      it('change son suivi', async () => {
        // Given
        const [beneficiaire] = beneficiaires
        const conversationCard = screen
          .getByText(`${beneficiaire.prenom} ${beneficiaire.nom}`)
          .closest('div')
        const flagConversation = within(conversationCard!).getByRole('switch', {
          name: 'Suivi de la conversation avec Kenji Jirac',
        })

        // When
        await userEvent.click(flagConversation!)

        // Then
        expect(toggleFlag).toHaveBeenCalledWith(
          `chat-${beneficiaire.id}`,
          false
        )
      })
    })
  })

  describe("quand le conseiller n'a pas de beneficiaires", () => {
    it('affiche un message informatif', async () => {
      // Given
      ;(getMessageImportant as jest.Mock).mockResolvedValue(undefined)

      // When
      const { container } = await renderWithContexts(
        <ChatRoom
          beneficiairesChats={[]}
          onAccesConversation={() => {}}
          onAccesListes={() => {}}
          onOuvertureMenu={() => {}}
        />
      )

      // Then
      const results = await axe(container)
      expect(results).toHaveNoViolations()
      expect(screen.getByText('Vous pouvez échanger :')).toBeInTheDocument()
      expect(
        screen.getByText('directement avec un bénéficiaire')
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'en envoyant un message à plusieurs bénéficiaires simultanément'
        )
      ).toBeInTheDocument()
    })
  })

  // FIXME: mock le resizeWindow
  xdescribe('quand on est sur un écran à partir de 600 px', () => {
    it('affiche une barre de recherches pour filtrer les conversations avec les bénéficiaires', async () => {
      // Given
      await renderWithContexts(
        <ChatRoom
          beneficiairesChats={beneficiairesChats}
          onAccesConversation={() => {}}
          onAccesListes={() => {}}
          onOuvertureMenu={() => {}}
        />
      )

      // When
      resizeWindow(800)

      // Then
      expect(screen.getByTestId('form-chat')).toBeInTheDocument()
    })
  })
})

const resizeWindow = (x: number) => {
  window = Object.assign(window, { innerWidth: x })
  window.dispatchEvent(new Event('resize'))
}
