import { userEvent } from '@storybook/testing-library'
import {
  act,
  fireEvent,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { Mock } from 'jest-mock'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import renderWithSession from '../renderWithSession'

import { desJeunes } from 'fixtures/jeune'
import { mockedJeunesService, mockedMessagesService } from 'fixtures/services'
import { UserStructure } from 'interfaces/conseiller'
import { Jeune } from 'interfaces/jeune'
import EnvoiMessageGroupe, {
  getServerSideProps,
} from 'pages/mes-jeunes/envoi-message-groupe'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { DIProvider } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('next/router', () => ({ useRouter: jest.fn() }))
jest.mock('components/Modal')
jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('EnvoiMessageGroupe', () => {
  describe('client side', () => {
    let jeunes: Jeune[]
    let jeunesService: JeunesService
    let messagesService: MessagesService
    let page: RenderResult
    let inputSearchJeune: HTMLSelectElement
    let inputMessage: HTMLInputElement
    let submitButton: HTMLButtonElement

    beforeEach(async () => {
      jeunes = desJeunes()

      jeunesService = mockedJeunesService()

      messagesService = mockedMessagesService({
        sendNouveauMessageGroupe: jest.fn(() => {
          return Promise.resolve()
        }),
      })

      page = renderWithSession(
        <DIProvider dependances={{ jeunesService, messagesService }}>
          <EnvoiMessageGroupe
            pageTitle={''}
            jeunes={jeunes}
            withoutChat={true}
            returnTo='/mes-jeunes'
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
        expect(screen.getAllByRole('group').length).toBe(2)
        expect(screen.getByLabelText('* Message')).toBeInTheDocument()
        expect(inputSearchJeune).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: 'Envoyer' })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('link', { name: 'Annuler' })
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

    describe('quand on remplit le formulaire', () => {
      let push: jest.Mock
      let newMessage: string
      beforeEach(() => {
        push = jest.fn(() => Promise.resolve())
        ;(useRouter as jest.Mock).mockReturnValue({ push })

        // Given
        newMessage = 'Un nouveau message pour plusieurs destinataires'

        userEvent.type(inputSearchJeune, 'Jirac Kenji')
        userEvent.type(inputSearchJeune, 'Sanfamiye Nadia')
      })

      it('sélectionne plusieurs jeunes dans la liste', () => {
        // Then
        expect(screen.getByText('Jirac Kenji')).toBeInTheDocument()
        expect(screen.getByText('Sanfamiye Nadia')).toBeInTheDocument()
        expect(screen.getByText('Destinataires (2)')).toBeInTheDocument()
      })

      it('envoi un message à plusieurs destinataires', async () => {
        // When
        fireEvent.change(inputMessage, { target: { value: newMessage } })
        fireEvent.click(submitButton)

        // Then
        await waitFor(() => {
          expect(messagesService.sendNouveauMessageGroupe).toHaveBeenCalledWith(
            { id: '1', structure: UserStructure.MILO },
            [jeunes[0].id, jeunes[1].id],
            newMessage,
            'accessToken',
            'cleChiffrement'
          )
        })
      })

      it('redirige vers la page précédente', async () => {
        // Given
        fireEvent.change(inputMessage, { target: { value: newMessage } })

        // When
        fireEvent.click(submitButton)

        // Then
        await waitFor(() => {
          expect(push).toHaveBeenCalledWith('/mes-jeunes?envoiMessage=succes')
        })
      })

      // FIXME back bouton triggers modale when hasChanges
      // it('prévient avant de revenir à la page précédente', async () => {
      //   // Given
      //   const previousButton = screen.getByText(
      //     "Quitter la rédaction d'un message à plusieurs jeunes"
      //   )
      //
      //   // When
      //   await act(async () => previousButton.click())
      //
      //   // Then
      //   expect(() => screen.getByText('Page précédente')).toThrow()
      //   expect(previousButton).not.toHaveAttribute('href')
      //   expect(push).not.toHaveBeenCalled()
      //   expect(
      //     screen.getByText(
      //       "Vous allez quitter la page d'édition d’un message à plusieurs jeunes."
      //     )
      //   ).toBeInTheDocument()
      // })

      it("prévient avant d'annuler", async () => {
        // Given
        const cancelButton = screen.getByText('Annuler')

        // When
        await act(async () => cancelButton.click())

        // Then
        expect(cancelButton).not.toHaveAttribute('href')
        expect(push).not.toHaveBeenCalled()
        expect(
          screen.getByText(
            "Vous allez quitter la page d'édition d’un message à plusieurs jeunes."
          )
        ).toBeInTheDocument()
      })

      it("devrait afficher un message d'erreur en cas d'échec de l'envoi du message", async () => {
        // Given
        const messageErreur =
          "Suite à un problème inconnu l'envoi du message a échoué. Vous pouvez réessayer."
        ;(
          messagesService.sendNouveauMessageGroupe as Mock<any>
        ).mockRejectedValue({
          message: 'whatever',
        })

        // When
        userEvent.type(inputSearchJeune, 'Jirac Kenji')
        fireEvent.change(inputMessage, { target: { value: 'un message' } })
        fireEvent.click(submitButton)

        // Then
        await waitFor(() => {
          expect(
            messagesService.sendNouveauMessageGroupe
          ).toHaveBeenCalledTimes(1)
        })
        expect(screen.getByText(messageErreur)).toBeInTheDocument()
      })
    })

    describe('quand on selectionne tout les jeunes dans le champs de recherche', () => {
      it('sélectionne tout les jeunes dans la liste', () => {
        // When
        userEvent.type(inputSearchJeune, 'Sélectionner tous mes jeunes')

        // Then
        expect(screen.getByText('Jirac Kenji')).toBeInTheDocument()
        expect(screen.getByText('Sanfamiye Nadia')).toBeInTheDocument()
        expect(
          screen.getByText("D'Aböville-Muñoz François Maria")
        ).toBeInTheDocument()
        expect(screen.getByText('Destinataires (3)')).toBeInTheDocument()
      })
    })
  })

  describe('server side', () => {
    it('requiert une session valide', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: 'wherever',
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: 'wherever' })
    })

    describe("quand l'utilisateur est connecté", () => {
      let jeunes: Jeune[]
      beforeEach(() => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: 'id-conseiller' },
            accessToken: 'accessToken',
          },
        })
        jeunes = desJeunes()
        const jeunesService = mockedJeunesService({
          getJeunesDuConseiller: jest.fn(async () => jeunes),
        })
        ;(withDependance as jest.Mock).mockReturnValue(jeunesService)
      })

      it('récupère la liste des jeunes du conseiller', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: { referer: 'http://localhost:3000/mes-rendezvous' } },
        } as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            jeunes: [jeunes[2], jeunes[0], jeunes[1]],
            withoutChat: true,
            pageTitle: 'Message multi-destinataires',
            returnTo: 'http://localhost:3000/mes-rendezvous',
          },
        })
      })

      it('ignore le referer si besoin', async () => {
        // When
        const actual = await getServerSideProps({
          req: {
            headers: {
              referer:
                'http://localhost:3000/index?redirectUrl=%2Fmes-jeunes%2Fenvoi-message-groupe',
            },
          },
        } as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            jeunes: [jeunes[2], jeunes[0], jeunes[1]],
            withoutChat: true,
            pageTitle: 'Message multi-destinataires',
            returnTo: '/mes-jeunes',
          },
        })
      })
    })
  })
})
