import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import { desItemsJeunes } from 'fixtures/jeune'
import {
  mockedFichiersService,
  mockedJeunesService,
  mockedMessagesService,
} from 'fixtures/services'
import { UserStructure } from 'interfaces/conseiller'
import { JeuneFromListe } from 'interfaces/jeune'
import EnvoiMessageGroupe, {
  getServerSideProps,
} from 'pages/mes-jeunes/envoi-message-groupe'
import { FichiersService } from 'services/fichiers.service'
import { MessagesService } from 'services/messages.service'
import renderPage from 'tests/renderPage'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { ApiError } from 'utils/httpClient'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('components/Modal')
jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('EnvoiMessageGroupe', () => {
  describe('client side', () => {
    let jeunes: JeuneFromListe[]
    let messagesService: MessagesService
    let fichiersService: FichiersService
    let inputSearchJeune: HTMLSelectElement
    let inputMessage: HTMLInputElement
    let fileInput: HTMLInputElement
    let submitButton: HTMLButtonElement

    beforeEach(async () => {
      jeunes = desItemsJeunes()

      messagesService = mockedMessagesService({
        sendNouveauMessageGroupe: jest.fn(() => {
          return Promise.resolve()
        }),
      })
      fichiersService = mockedFichiersService({
        uploadFichier: jest
          .fn()
          .mockResolvedValue({ id: 'id-fichier', nom: 'imageupload.png' }),
      })

      renderPage(
        <EnvoiMessageGroupe
          pageTitle={''}
          jeunes={jeunes}
          withoutChat={true}
          returnTo='/mes-jeunes'
        />,
        {
          customDependances: {
            messagesService,
            fichiersService,
          },
        }
      )

      inputSearchJeune = screen.getByRole('combobox', {
        name: 'Rechercher et ajouter des jeunes Nom et pr??nom',
      })
      inputMessage = screen.getByLabelText('* Message')
      fileInput = screen.getByLabelText('Ajouter une pi??ce jointe')

      submitButton = screen.getByRole('button', {
        name: 'Envoyer',
      })
    })

    describe("quand le formulaire n'a pas encore ??t?? soumis", () => {
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

      it('permet l???ajout d???une pi??ce jointe', () => {
        // Then
        expect(fileInput).toBeInTheDocument()
        expect(screen.getByText(/Taille maximum autoris??e/)).toBeInTheDocument()
        expect(
          screen.getByText(/Attention ?? ne pas partager de donn??es sensibles/)
        ).toBeInTheDocument()
      })

      it('ne devrait pas pouvoir cliquer sur le bouton envoyer avec un champ du formulaire vide', async () => {
        // Given
        await userEvent.type(inputMessage, 'Un message')

        // Then
        expect(inputSearchJeune.selectedOptions).toBe(undefined)
        expect(inputMessage.value).toEqual('Un message')
        expect(submitButton).toHaveAttribute('disabled')
      })
    })

    describe('quand on remplit le formulaire', () => {
      let push: Function
      let newMessage: string
      beforeEach(async () => {
        push = jest.fn(() => Promise.resolve())
        ;(useRouter as jest.Mock).mockReturnValue({ push })

        // Given
        newMessage = 'Un nouveau message pour plusieurs destinataires'

        await userEvent.type(inputSearchJeune, 'Jirac Kenji')
        await userEvent.type(inputSearchJeune, 'Sanfamiye Nadia')
        await userEvent.type(inputMessage, newMessage)
      })

      it('s??lectionne plusieurs jeunes dans la liste', () => {
        // Then
        expect(screen.getByText('Jirac Kenji')).toBeInTheDocument()
        expect(screen.getByText('Sanfamiye Nadia')).toBeInTheDocument()
        expect(screen.getByText('Destinataires (2)')).toBeInTheDocument()
      })

      it('envoi un message ?? plusieurs destinataires', async () => {
        // When
        await userEvent.click(submitButton)

        // Then
        expect(fichiersService.uploadFichier).toHaveBeenCalledTimes(0)
        expect(messagesService.sendNouveauMessageGroupe).toHaveBeenCalledWith({
          conseiller: {
            id: '1',
            structure: UserStructure.MILO,
          },
          idsDestinataires: [jeunes[0].id, jeunes[1].id],
          newMessage,
          accessToken: 'accessToken',
          cleChiffrement: 'cleChiffrement',
        })
      })

      it('redirige vers la page pr??c??dente', async () => {
        // When
        await userEvent.click(submitButton)

        // Then
        expect(push).toHaveBeenCalledWith({
          pathname: '/mes-jeunes',
          query: { envoiMessage: 'succes' },
        })
      })

      // FIXME trouver comment tester
      // it('pr??vient avant de revenir ?? la page pr??c??dente', async () => {
      //   // Given
      //   const previousButton = screen.getByText(
      //     "Quitter la r??daction d'un message ?? plusieurs jeunes"
      //   )
      //
      //   // When
      //   await userEvent.click(previousButton)
      //
      //   // Then
      //   expect(() => screen.getByText('Page pr??c??dente')).toThrow()
      //   expect(previousButton).not.toHaveAttribute('href')
      //   expect(push).not.toHaveBeenCalled()
      //   expect(
      //     screen.getByText(
      //       "Vous allez quitter la page d'??dition d???un message ?? plusieurs jeunes."
      //     )
      //   ).toBeInTheDocument()
      // })

      it("pr??vient avant d'annuler", async () => {
        // Given
        const cancelButton = screen.getByText('Annuler')

        // When
        await userEvent.click(cancelButton)

        // Then
        expect(cancelButton).not.toHaveAttribute('href')
        expect(push).not.toHaveBeenCalled()
        expect(
          screen.getByText(
            "Vous allez quitter la page d'??dition d???un message ?? plusieurs jeunes."
          )
        ).toBeInTheDocument()
      })

      it("affiche un message d'erreur en cas d'??chec de l'envoi du message", async () => {
        // Given
        const messageErreur =
          "Suite ?? un probl??me inconnu l'envoi du message a ??chou??. Vous pouvez r??essayer."
        ;(
          messagesService.sendNouveauMessageGroupe as jest.Mock
        ).mockRejectedValue({
          message: 'whatever',
        })

        // When
        await userEvent.type(inputSearchJeune, 'Jirac Kenji')
        await userEvent.type(inputMessage, 'un message')
        await userEvent.click(submitButton)

        // Then
        expect(messagesService.sendNouveauMessageGroupe).toHaveBeenCalledTimes(
          1
        )
        expect(screen.getByText(messageErreur)).toBeInTheDocument()
      })
    })

    describe('quand on remplit le formulaire avec une pi??ce jointe', () => {
      let push: Function
      let newMessage: string
      let file: File
      beforeEach(async () => {
        push = jest.fn(() => Promise.resolve())
        ;(useRouter as jest.Mock).mockReturnValue({ push })
        ;(fichiersService.uploadFichier as jest.Mock).mockResolvedValue({
          id: 'id-fichier',
          nom: 'nom-fichier.png',
        })

        // Given
        newMessage = 'Un nouveau message pour plusieurs destinataires'

        await userEvent.type(inputSearchJeune, 'Jirac Kenji')
        await userEvent.type(inputSearchJeune, 'Sanfamiye Nadia')
        await userEvent.type(inputMessage, newMessage)

        file = new File(['un contenu'], 'imageupload.png', {
          type: 'image/png',
        })
        await userEvent.upload(fileInput, file, { applyAccept: false })
      })

      it('affiche le nom du fichier s??lectionn??', () => {
        // Then
        expect(screen.getByText('imageupload.png')).toBeInTheDocument()
      })

      it('permet la suppression de la pi??ce jointe', async () => {
        // When
        await userEvent.click(screen.getByText('Enlever fichier'))

        // Then
        expect(() => screen.getByText('imageupload.png')).toThrow()
      })

      it('envoi un message ?? plusieurs destinataires avec pi??ce jointe', async () => {
        // When
        await userEvent.click(submitButton)

        // Then
        expect(fichiersService.uploadFichier).toHaveBeenCalledWith(
          [jeunes[0].id, jeunes[1].id],
          file,
          'accessToken'
        )
        expect(messagesService.sendNouveauMessageGroupe).toHaveBeenCalledWith({
          conseiller: {
            id: '1',
            structure: UserStructure.MILO,
          },
          idsDestinataires: [jeunes[0].id, jeunes[1].id],
          newMessage,
          accessToken: 'accessToken',
          cleChiffrement: 'cleChiffrement',
          infoPieceJointe: { id: 'id-fichier', nom: 'nom-fichier.png' },
        })
      })

      it('envoi une pi??ce jointe ?? plusieurs destinataires avec un message par d??faut', async () => {
        // Given
        await userEvent.clear(inputMessage)

        // When
        await userEvent.click(submitButton)

        // Then
        expect(fichiersService.uploadFichier).toHaveBeenCalledWith(
          [jeunes[0].id, jeunes[1].id],
          file,
          'accessToken'
        )
        expect(messagesService.sendNouveauMessageGroupe).toHaveBeenCalledWith({
          conseiller: {
            id: '1',
            structure: UserStructure.MILO,
          },
          idsDestinataires: [jeunes[0].id, jeunes[1].id],
          newMessage:
            'Votre conseiller vous a transmis une nouvelle pi??ce jointe : ',
          accessToken: 'accessToken',
          cleChiffrement: 'cleChiffrement',
          infoPieceJointe: { id: 'id-fichier', nom: 'nom-fichier.png' },
        })
      })

      it("affiche un message d'erreur en cas d'??chec de l'upload de la pi??ce jointe", async () => {
        // Given
        const messageErreur = 'Le poids du document d??passe 5Mo'
        ;(fichiersService.uploadFichier as jest.Mock).mockRejectedValue(
          new ApiError(400, messageErreur)
        )

        // When
        await userEvent.click(submitButton)

        // Then
        expect(fichiersService.uploadFichier).toHaveBeenCalledTimes(1)
        expect(messagesService.sendNouveauMessageGroupe).toHaveBeenCalledTimes(
          0
        )
        expect(screen.getByText(messageErreur)).toBeInTheDocument()
      })
    })

    describe('quand on selectionne tout les jeunes dans le champs de recherche', () => {
      it('s??lectionne tout les jeunes dans la liste', async () => {
        // When
        await userEvent.type(inputSearchJeune, 'S??lectionner tous mes jeunes')

        // Then
        expect(screen.getByText('Jirac Kenji')).toBeInTheDocument()
        expect(screen.getByText('Sanfamiye Nadia')).toBeInTheDocument()
        expect(
          screen.getByText("D'Ab??ville-Mu??oz Fran??ois Maria")
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

    describe("quand l'utilisateur est connect??", () => {
      let jeunes: JeuneFromListe[]
      beforeEach(() => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: 'id-conseiller' },
            accessToken: 'accessToken',
          },
        })
        jeunes = desItemsJeunes()
        const jeunesService = mockedJeunesService({
          getJeunesDuConseiller: jest.fn(async () => jeunes),
        })
        ;(withDependance as jest.Mock).mockReturnValue(jeunesService)
      })

      it('r??cup??re la liste des jeunes du conseiller', async () => {
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
