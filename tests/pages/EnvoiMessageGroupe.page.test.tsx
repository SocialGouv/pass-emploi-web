import {
  act,
  fireEvent,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { mockedJeunesService } from 'fixtures/services'
import EnvoiMessageGroupe from 'pages/mes-jeunes/envoi-message-groupe'
import { JeunesService } from 'services/jeunes.service'
import { DIProvider } from 'utils/injectionDependances'
import renderWithSession from '../renderWithSession'
import { MessagesService } from 'services/messages.service'
import { unJeune } from 'fixtures/jeune'
import { UserStructure } from 'interfaces/conseiller'
import { Session } from 'next-auth'
import { Jeune } from 'interfaces/jeune'
import { mockedJeunesService, mockedMessagesService } from 'fixtures/services'
import { userEvent } from '@storybook/testing-library'
import MiloCreationJeune from '../../pages/mes-jeunes/milo/creation-jeune'

jest.mock('next/router')

describe('EnvoiMessageGroupe', () => {
  let destinataires: Jeune[]
  let conseiller: Session.User
  let jeunesService: JeunesService
  let messagesService: MessagesService
  let page: RenderResult
  let inputSearchJeune: HTMLSelectElement
  let inputMessage: HTMLInputElement
  let submitButton: HTMLButtonElement
  let accessToken: string

  beforeEach(async () => {
    jeunesService = mockedJeunesService()
    jeunesChat = [unJeuneChat()]
    destinataires = [unJeune()]

    jeunesService = mockedJeunesService()

    messagesService = mockedMessagesService({
      sendNouveauMessageMultiple: jest.fn(() => {
        return Promise.resolve()
      }),
    })

    conseiller = {
      id: 'idConseiller',
      name: 'Tavernier',
      structure: UserStructure.POLE_EMPLOI,
      estSuperviseur: false,
    }
    accessToken = 'accessToken'

    act(() => {
      page = renderWithSession(
        <DIProvider dependances={{ jeunesService, messagesService }}>
          <EnvoiMessageGroupe jeunes={destinataires} withoutChat={true} />
        </DIProvider>
      )
    })

    inputSearchJeune = screen.getByRole('combobox')
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
    it('envoi un message à plusieurs destinataires', async () => {
      // Given
      const newMessage = 'Un nouveau message pour plusieurs destinataires'

      // When
      userEvent.type(inputSearchJeune, 'Jirac Kenji')
      fireEvent.change(inputMessage, { target: { value: newMessage } })
      fireEvent.click(submitButton)

      // Then
      expect(screen.getByText('Jirac Kenji')).toBeInTheDocument()
      expect(screen.getByText('Destinataires (1)')).toBeInTheDocument()

      await waitFor(() => {
        expect(messagesService.sendNouveauMessageMultiple).toHaveBeenCalledWith(
          { id: conseiller.id, structure: conseiller.structure },
          destinataires,
          newMessage,
          accessToken
        )
      })
    })
  })
})
