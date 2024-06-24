import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'

import EnvoiMessageGroupePage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/envoi-message-groupe/EnvoiMessageGroupePage'
import { desItemsJeunes } from 'fixtures/jeune'
import { desListesDeDiffusion } from 'fixtures/listes-de-diffusion'
import { BeneficiaireFromListe } from 'interfaces/beneficiaire'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { AlerteParam } from 'referentiel/alerteParam'
import { uploadFichier } from 'services/fichiers.service'
import { sendNouveauMessageGroupe, signIn } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'
import { ApiError } from 'utils/httpClient'

jest.mock('components/Modal')
jest.mock('services/fichiers.service')
jest.mock('services/messages.service')

describe('EnvoiMessageGroupePage client side', () => {
  let jeunes: BeneficiaireFromListe[]
  let listesDeDiffusion: ListeDeDiffusion[]

  let inputSearchJeune: HTMLSelectElement
  let inputMessage: HTMLInputElement
  let fileInput: HTMLInputElement
  let submitButton: HTMLButtonElement

  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  let push: Function
  beforeEach(async () => {
    alerteSetter = jest.fn()
    push = jest.fn(() => Promise.resolve())
    ;(useRouter as jest.Mock).mockReturnValue({ push })

    jeunes = desItemsJeunes()
    listesDeDiffusion = desListesDeDiffusion()
    ;(signIn as jest.Mock).mockResolvedValue(undefined)
    ;(sendNouveauMessageGroupe as jest.Mock).mockResolvedValue(undefined)
    ;(uploadFichier as jest.Mock).mockResolvedValue({
      id: 'id-fichier',
      nom: 'imageupload.png',
    })

    renderWithContexts(
      <EnvoiMessageGroupePage
        listesDiffusion={listesDeDiffusion}
        returnTo='/mes-jeunes'
      />,
      {
        customAlerte: { alerteSetter },
      }
    )

    inputSearchJeune = screen.getByRole('combobox', {
      name: /Destinataires/,
    })
    inputMessage = screen.getByLabelText('* Message')
    fileInput = screen.getByLabelText('Ajouter une pièce jointe')

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
      expect(screen.getByRole('link', { name: 'Annuler' })).toBeInTheDocument()
    })

    it('permet l’ajout d’une pièce jointe', () => {
      // Then
      expect(fileInput).toBeInTheDocument()
      expect(screen.getByText(/Taille maximum autorisée/)).toBeInTheDocument()
      expect(
        screen.getByText(/Attention à ne pas partager de données sensibles/)
      ).toBeInTheDocument()
    })

    it('affiche un lien qui renvoie vers la page de gestion des listes de diffusion', () => {
      // Then
      expect(
        screen.getByRole('link', { name: 'Gérer mes listes de diffusion' })
      ).toHaveAttribute('href', '/mes-jeunes/listes-de-diffusion')
    })

    it('ne valide pas le formulaire si aucun bénéficiaire n’est sélectionné', async () => {
      // When
      await userEvent.click(submitButton)

      // Then
      expect(sendNouveauMessageGroupe).not.toHaveBeenCalled()
      expect(
        screen.getByText(/Le champ ”Destinataires” est vide./)
      ).toBeInTheDocument()
    })

    it('ne valide pas le formulaire si aucun message ou pièce jointe n’est renseigné', async () => {
      // Given
      await userEvent.type(inputSearchJeune, 'Sanfamiye Nadia')

      //When
      await userEvent.click(submitButton)

      // Then
      expect(sendNouveauMessageGroupe).not.toHaveBeenCalled()
      expect(
        screen.getByText(/Le champ ”Message” est vide./)
      ).toBeInTheDocument()
    })
  })

  describe('quand on remplit le formulaire', () => {
    let newMessage: string
    beforeEach(async () => {
      // Given
      newMessage = 'Un nouveau message pour plusieurs destinataires'

      await userEvent.type(inputSearchJeune, 'Sanfamiye Nadia')
      await userEvent.type(inputSearchJeune, 'Liste export international (1)')
      await userEvent.type(inputMessage, newMessage)
    })

    it('sélectionne plusieurs jeunes dans la liste', () => {
      // Then
      expect(screen.getByText('Destinataires (2)')).toBeInTheDocument()
      expect(screen.getByText('Sanfamiye Nadia')).toBeInTheDocument()
      expect(
        screen.getByText('Liste export international (1)')
      ).toBeInTheDocument()
    })

    it('envoi un message à plusieurs destinataires', async () => {
      // When
      await userEvent.click(submitButton)

      // Then
      expect(uploadFichier).toHaveBeenCalledTimes(0)
      expect(sendNouveauMessageGroupe).toHaveBeenCalledWith({
        idsBeneficiaires: [jeunes[1].id],
        idsListesDeDiffusion: ['liste-1'],
        newMessage,
        cleChiffrement: 'cleChiffrement',
      })
    })

    it('redirige vers la page précédente', async () => {
      // When
      await userEvent.click(submitButton)

      // Then
      expect(alerteSetter).toHaveBeenCalledWith('envoiMessage')
      expect(push).toHaveBeenCalledWith('/mes-jeunes')
    })

    // FIXME trouver comment tester
    // it('prévient avant de revenir à la page précédente', async () => {
    //   // Given
    //   const previousButton = screen.getByText(
    //     "Quitter la rédaction d'un message à plusieurs jeunes"
    //   )
    //
    //   // When
    //   await userEvent.click(previousButton)
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
      await userEvent.click(cancelButton)

      // Then
      expect(cancelButton).not.toHaveAttribute('href')
      expect(push).not.toHaveBeenCalled()
      expect(
        screen.getByText(
          'Souhaitez-vous quitter la rédaction du message multi-destinataires ?'
        )
      ).toBeInTheDocument()
    })

    it("affiche un message d'erreur en cas d'échec de l'envoi du message", async () => {
      // Given
      const messageErreur =
        "Suite à un problème inconnu l'envoi du message a échoué. Vous pouvez réessayer."
      ;(sendNouveauMessageGroupe as jest.Mock).mockRejectedValue({
        message: 'whatever',
      })

      // When
      await userEvent.click(submitButton)

      // Then
      expect(sendNouveauMessageGroupe).toHaveBeenCalledTimes(1)
      expect(screen.getByText(messageErreur)).toBeInTheDocument()
    })
  })

  describe('quand on remplit le formulaire avec une pièce jointe', () => {
    let push: Function
    let newMessage: string
    let file: File
    beforeEach(async () => {
      push = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({ push })
      ;(uploadFichier as jest.Mock).mockResolvedValue({
        id: 'id-fichier',
        nom: 'nom-fichier.png',
      })

      // Given
      newMessage = 'Un nouveau message pour plusieurs destinataires'
      file = new File(['un contenu'], 'imageupload.png', {
        type: 'image/png',
      })

      await userEvent.type(inputSearchJeune, 'Sanfamiye Nadia')
      await userEvent.type(inputSearchJeune, 'Liste export international (1)')
      await userEvent.type(inputMessage, newMessage)
      await userEvent.upload(fileInput, file, { applyAccept: false })
    })

    it('affiche le nom du fichier sélectionné', () => {
      // Then
      expect(screen.getByText('imageupload.png')).toBeInTheDocument()
    })

    it('permet la suppression de la pièce jointe', async () => {
      // When
      await userEvent.click(screen.getByText('Enlever fichier imageupload.png'))

      // Then
      expect(() => screen.getByText('imageupload.png')).toThrow()
    })

    it('envoi un message à plusieurs destinataires avec pièce jointe', async () => {
      // When
      await userEvent.click(submitButton)

      // Then
      expect(uploadFichier).toHaveBeenCalledWith(
        [jeunes[1].id],
        ['liste-1'],
        file
      )
      expect(sendNouveauMessageGroupe).toHaveBeenCalledWith({
        idsBeneficiaires: [jeunes[1].id],
        idsListesDeDiffusion: ['liste-1'],
        newMessage,
        cleChiffrement: 'cleChiffrement',
        infoPieceJointe: { id: 'id-fichier', nom: 'nom-fichier.png' },
      })
    })

    it('envoi une pièce jointe à plusieurs destinataires avec un message par défaut', async () => {
      // Given
      await userEvent.clear(inputMessage)

      // When
      await userEvent.click(submitButton)

      // Then
      expect(uploadFichier).toHaveBeenCalledWith(
        [jeunes[1].id],
        ['liste-1'],
        file
      )
      expect(sendNouveauMessageGroupe).toHaveBeenCalledWith({
        idsBeneficiaires: [jeunes[1].id],
        idsListesDeDiffusion: ['liste-1'],
        newMessage:
          'Votre conseiller vous a transmis une nouvelle pièce jointe : ',
        cleChiffrement: 'cleChiffrement',
        infoPieceJointe: { id: 'id-fichier', nom: 'nom-fichier.png' },
      })
    })

    it("affiche un message d'erreur en cas d'échec de l'upload de la pièce jointe", async () => {
      // Given
      const messageErreur = 'Le poids du document dépasse 5Mo'
      ;(uploadFichier as jest.Mock).mockRejectedValue(
        new ApiError(400, messageErreur)
      )

      // When
      await userEvent.click(submitButton)

      // Then
      expect(uploadFichier).toHaveBeenCalledTimes(1)
      expect(sendNouveauMessageGroupe).toHaveBeenCalledTimes(0)
      expect(screen.getByText(messageErreur)).toBeInTheDocument()
    })
  })

  describe('quand on selectionne tout les jeunes dans le champ de recherche', () => {
    it('sélectionne tout les jeunes dans la liste', async () => {
      // When
      await userEvent.type(
        inputSearchJeune,
        'Sélectionner tous mes destinataires'
      )

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
