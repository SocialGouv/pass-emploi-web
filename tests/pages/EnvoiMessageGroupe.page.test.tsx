import {
  fireEvent,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import EnvoiMessageGroupe from 'pages/mes-jeunes/envoi-message-groupe'
import { JeunesService } from 'services/jeunes.service'
import { DIProvider } from 'utils/injectionDependances'
import renderWithSession from '../renderWithSession'
import { MessagesService } from 'services/messages.service'
import { desJeunes } from 'fixtures/jeune'
import { UserStructure } from 'interfaces/conseiller'
import { Jeune } from 'interfaces/jeune'
import { mockedJeunesService, mockedMessagesService } from 'fixtures/services'
import { userEvent } from '@storybook/testing-library'
import { Mock } from 'jest-mock'
import { useRouter } from 'next/router'

jest.mock('next/router', () => ({ useRouter: jest.fn() }))

describe('EnvoiMessageGroupe', () => {
  let destinataires: Jeune[]
  let jeunesService: JeunesService
  let messagesService: MessagesService
  let page: RenderResult
  let inputSearchJeune: HTMLSelectElement
  let inputMessage: HTMLInputElement
  let submitButton: HTMLButtonElement
  let accessToken: string

  beforeEach(async () => {
    destinataires = desJeunes()

    jeunesService = mockedJeunesService()

    messagesService = mockedMessagesService({
      sendNouveauMessageMultiple: jest.fn(() => {
        return Promise.resolve()
      }),
    })

    accessToken = 'accessToken'

    page = renderWithSession(
      <DIProvider dependances={{ jeunesService, messagesService }}>
        <EnvoiMessageGroupe
          jeunes={destinataires}
          withoutChat={true}
          from='/'
        />
      </DIProvider>
    )

    inputSearchJeune = screen.getByRole('combobox', {
      name: 'Rechercher et ajouter des jeunes Nom et prénom',
    })
    inputMessage = screen.getByLabelText('* Message')
    submitButton = screen.getByRole('button', {
      name: 'Envoyer',
    })
  })

  describe("quand le formulaire n'a pas encore été soumis", () => {
    it('devrait afficher les champs pour envoyer un message', () => {
      // Then
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Message multi-destinataires',
        })
      ).toBeInTheDocument()

      expect(screen.getAllByRole('group').length).toBe(2)
      expect(screen.getByLabelText('* Message')).toBeInTheDocument()
      expect(inputSearchJeune).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Envoyer' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Annuler' })
      ).toBeInTheDocument()
    })

    it('ne devrait pas pouvoir cliquer sur le bouton envoyer avec un champ du formulaire vide', () => {
      // Given
      fireEvent.change(inputMessage, { target: { value: 'Un message' } })

      // Then
      expect(inputSearchJeune.selectedOptions).toBe(undefined)
      expect(inputMessage.value).toEqual('Un message')
      expect(submitButton).toHaveAttribute('disabled')
    })
  })

  describe('quand on soumet le formulaire', () => {
    beforeEach(() => {
      let push: jest.Mock
      push = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({ push })
    })

    it('envoi un message à plusieurs destinataires', async () => {
      // Given
      const newMessage = 'Un nouveau message pour plusieurs destinataires'
      destinataires = [destinataires[0], destinataires[1]]
      // When
      userEvent.type(inputSearchJeune, 'Jirac Kenji')
      userEvent.type(inputSearchJeune, 'Sanfamiye Nadia')
      fireEvent.change(inputMessage, { target: { value: newMessage } })
      fireEvent.click(submitButton)

      // Then
      expect(screen.getByText('Jirac Kenji')).toBeInTheDocument()
      expect(screen.getByText('Sanfamiye Nadia')).toBeInTheDocument()
      expect(screen.getByText('Destinataires (2)')).toBeInTheDocument()

      await waitFor(() => {
        expect(messagesService.sendNouveauMessageMultiple).toHaveBeenCalledWith(
          { id: '1', structure: UserStructure.MILO },
          destinataires,
          newMessage,
          accessToken
        )
      })
    })

    it("devrait afficher un message d'erreur en cas d'échec de l'envoi du message", async () => {
      // Given
      const messageErreur =
        "Suite à un problème inconnu l'envoi du message a échoué. Vous pouvez réessayer."
      ;(
        messagesService.sendNouveauMessageMultiple as Mock<any>
      ).mockRejectedValue({
        message: messageErreur,
      })

      // When
      userEvent.type(inputSearchJeune, 'Jirac Kenji')
      fireEvent.change(inputMessage, { target: { value: 'un message' } })
      fireEvent.click(submitButton)

      // Then
      await waitFor(() => {
        expect(
          messagesService.sendNouveauMessageMultiple
        ).toHaveBeenCalledTimes(1)
      })
      expect(screen.getByText(messageErreur)).toBeInTheDocument()
    })
  })
})
