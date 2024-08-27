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
  extractBaseBeneficiaire,
  unBeneficiaireChat,
} from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { BaseBeneficiaire, BeneficiaireChat } from 'interfaces/beneficiaire'
import {
  desactiverMessageImportant,
  getMessageImportant,
  sendNouveauMessageImportant,
  toggleFlag,
} from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/messages.service')
jest.mock('components/layouts/AlerteDisplayer', () => jest.fn(() => <></>))
jest.mock('components/Modal')

describe('<ChatRoom />', () => {
  const beneficiaires: BaseBeneficiaire[] = desItemsBeneficiaires().map(
    extractBaseBeneficiaire
  )
  let beneficiairesChats: BeneficiaireChat[]

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
    let accederConversation: (idJeune: string) => void
    beforeEach(async () => {
      accederConversation = jest.fn()
    })

    it('n’affiche pas de pastille s’il n’y a pas de message configuré', async () => {
      //Given
      let container: HTMLElement
      ;(getMessageImportant as jest.Mock).mockResolvedValue(undefined)

      //When
      await act(async () => {
        ;({ container } = renderWithContexts(
          <ChatRoom
            beneficiairesChats={beneficiairesChats}
            showMenu={false}
            onAccesConversation={accederConversation}
            onAccesListesDiffusion={() => {}}
            onOuvertureMenu={() => {}}
          />,
          {
            customConseiller: unConseiller({ id: 'id-conseiller' }),
          }
        ))
      })

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

        await act(async () => {
          renderWithContexts(
            <ChatRoom
              beneficiairesChats={beneficiairesChats}
              showMenu={false}
              onAccesConversation={accederConversation}
              onAccesListesDiffusion={() => {}}
              onOuvertureMenu={() => {}}
            />,
            {
              customConseiller: unConseiller({ id: 'id-conseiller' }),
            }
          )
        })

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
        await act(async () => {
          renderWithContexts(
            <ChatRoom
              beneficiairesChats={beneficiairesChats}
              showMenu={false}
              onAccesConversation={accederConversation}
              onAccesListesDiffusion={() => {}}
              onOuvertureMenu={() => {}}
            />,
            {
              customConseiller: unConseiller({ id: 'id-conseiller' }),
            }
          )
        })

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

            await act(async () => {
              renderWithContexts(
                <ChatRoom
                  beneficiairesChats={beneficiairesChats}
                  showMenu={false}
                  onAccesConversation={accederConversation}
                  onAccesListesDiffusion={() => {}}
                  onOuvertureMenu={() => {}}
                />,
                {
                  customConseiller: unConseiller({ id: 'id-conseiller' }),
                }
              )
            })

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
            inputDateDebut = screen.getByLabelText('Date de début')
            inputDateFin = screen.getByLabelText('Date de fin')
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
              idConseiller: 'id-conseiller',
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
            await act(async () => {
              renderWithContexts(
                <ChatRoom
                  beneficiairesChats={beneficiairesChats}
                  showMenu={false}
                  onAccesConversation={accederConversation}
                  onAccesListesDiffusion={() => {}}
                  onOuvertureMenu={() => {}}
                />,
                {
                  customConseiller: unConseiller({ id: 'id-conseiller' }),
                }
              )
            })

            await userEvent.click(
              screen.getByRole('button', {
                name: 'Accéder aux actions de votre messagerie',
              })
            )

            const boutonSettings = screen.getByRole('button', {
              name: 'Configurer un message important',
            })

            await userEvent.click(boutonSettings)

            const inputDateDebut = screen.getByLabelText('Date de début')
            const inputDateFin = screen.getByLabelText('Date de fin')
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

        await act(async () => {
          renderWithContexts(
            <ChatRoom
              beneficiairesChats={beneficiairesChats}
              showMenu={false}
              onAccesConversation={accederConversation}
              onAccesListesDiffusion={() => {}}
              onOuvertureMenu={() => {}}
            />,
            {
              customConseiller: unConseiller({ id: 'id-conseiller' }),
            }
          )
        })

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
    let accederConversation: (idJeune: string) => void
    let container: HTMLElement
    beforeEach(async () => {
      ;(getMessageImportant as jest.Mock).mockResolvedValue(undefined)
      accederConversation = jest.fn()
      await act(async () => {
        ;({ container } = renderWithContexts(
          <ChatRoom
            beneficiairesChats={beneficiairesChats}
            showMenu={false}
            onAccesConversation={accederConversation}
            onAccesListesDiffusion={() => {}}
            onOuvertureMenu={() => {}}
          />,
          {}
        ))
      })
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results).toHaveNoViolations()
    })

    it('affiche les alertes sur petit écran', () => {
      expect(AlerteDisplayer).toHaveBeenCalledWith(
        { hideOnLargeScreen: true },
        {}
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
        const [beneficiaireSelectionne] = beneficiaires
        // Given
        const goToConversation = screen
          .getByText(beneficiaireSelectionne.prenom, {
            exact: false,
          })
          .closest('button')

        // When
        await userEvent.click(goToConversation!)

        // Then
        expect(accederConversation).toHaveBeenCalledTimes(1)
        expect(accederConversation).toHaveBeenCalledWith(
          beneficiaireSelectionne.id
        )
      })
    })

    describe("quand on clique sur le flag d'une conversation", () => {
      it('change son suivi', async () => {
        // Given
        const [beneficiaire] = beneficiaires
        const conversationCard = screen
          .getByText(beneficiaire.prenom, {
            exact: false,
          })
          .closest('div')
        const flagConversation = within(conversationCard!).getByRole('switch', {
          name: 'Suivre la conversation',
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
      let container: HTMLElement
      ;(getMessageImportant as jest.Mock).mockResolvedValue(undefined)

      // When
      await act(async () => {
        ;({ container } = renderWithContexts(
          <ChatRoom
            beneficiairesChats={[]}
            showMenu={false}
            onAccesConversation={() => {}}
            onAccesListesDiffusion={() => {}}
            onOuvertureMenu={() => {}}
          />,
          {}
        ))
      })

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
    it('affiche une barre de recherches pour filtrer les conversations avec les bénéficiaires', () => {
      // Given
      renderWithContexts(
        <ChatRoom
          beneficiairesChats={beneficiairesChats}
          showMenu={false}
          onAccesConversation={() => {}}
          onAccesListesDiffusion={() => {}}
          onOuvertureMenu={() => {}}
        />,
        {}
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
