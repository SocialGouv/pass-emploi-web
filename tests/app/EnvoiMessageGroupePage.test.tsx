import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useRouter } from 'next/navigation'

import EnvoiMessageGroupePage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/envoi-message-groupe/EnvoiMessageGroupePage'
import { desItemsBeneficiaires } from 'fixtures/beneficiaire'
import { desListes } from 'fixtures/listes'
import { BeneficiaireFromListe } from 'interfaces/beneficiaire'
import { Liste } from 'interfaces/liste'
import { AlerteParam } from 'referentiel/alerteParam'
import { uploadFichier } from 'services/fichiers.service'
import { sendNouveauMessageGroupe, signIn } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'
import { ApiError } from 'utils/httpClient'

jest.mock('components/ModalContainer')
jest.mock('services/fichiers.service')
jest.mock('services/messages.service')

describe('EnvoiMessageGroupePage client side', () => {
  let container: HTMLElement

  let beneficiaires: BeneficiaireFromListe[]
  let listes: Liste[]

  let inputSearchBeneficiaire: HTMLSelectElement
  let inputMessage: HTMLInputElement
  let fileInput: HTMLInputElement
  let submitButton: HTMLButtonElement

  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  let push: () => void
  beforeEach(async () => {
    alerteSetter = jest.fn()
    push = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({ push })

    beneficiaires = desItemsBeneficiaires()
    listes = desListes()
    ;(signIn as jest.Mock).mockResolvedValue(undefined)
    ;(sendNouveauMessageGroupe as jest.Mock).mockResolvedValue(undefined)
    ;(uploadFichier as jest.Mock).mockResolvedValue({
      id: 'id-fichier',
      nom: 'imageupload.png',
    })
    ;({ container } = await renderWithContexts(
      <EnvoiMessageGroupePage listes={listes} returnTo='/mes-jeunes' />,
      {
        customAlerte: { setter: alerteSetter },
      }
    ))

    inputSearchBeneficiaire = screen.getByRole('combobox', {
      name: /Destinataires/,
    })
    inputMessage = screen.getByRole('textbox', {
      name: '* Message Attention à nos propos. Ne sont autorisés, ni les commentaires insultants ou excessifs, ni les données trop personnelles ou sensibles.',
    })
    fileInput = screen.getByLabelText('Ajouter une pièce jointe')

    submitButton = screen.getByRole('button', {
      name: 'Envoyer',
    })
  })

  describe("quand le formulaire n'a pas encore été soumis", () => {
    it('a11y', async () => {
      let results: AxeResults
      await act(async () => {
        results = await axe(container)
      })
      expect(results!).toHaveNoViolations()
    })

    it('devrait afficher les champs pour envoyer un message', () => {
      // Then
      expect(screen.getAllByRole('group').length).toBe(2)
      expect(
        screen.getByRole('textbox', {
          name: '* Message Attention à nos propos. Ne sont autorisés, ni les commentaires insultants ou excessifs, ni les données trop personnelles ou sensibles.',
        })
      ).toBeInTheDocument()
      expect(inputSearchBeneficiaire).toBeInTheDocument()
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

    it('affiche un lien qui renvoie vers la page de gestion des listes', () => {
      // Then
      expect(
        screen.getByRole('link', { name: 'Gérer mes listes' })
      ).toHaveAttribute('href', '/mes-jeunes/listes')
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
      await userEvent.type(inputSearchBeneficiaire, 'Sanfamiye Nadia')

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

      await userEvent.type(inputSearchBeneficiaire, 'Sanfamiye Nadia')
      await userEvent.type(
        inputSearchBeneficiaire,
        'Liste export international (1)'
      )
      await userEvent.type(inputMessage, newMessage)
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('sélectionne plusieurs bénéficiaires dans la liste', () => {
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
        idsBeneficiaires: [beneficiaires[1].id],
        idsListes: ['liste-1'],
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
    let push: () => void
    let newMessage: string
    let file: File
    beforeEach(async () => {
      push = jest.fn()
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

      await userEvent.type(inputSearchBeneficiaire, 'Sanfamiye Nadia')
      await userEvent.type(
        inputSearchBeneficiaire,
        'Liste export international (1)'
      )
      await userEvent.type(inputMessage, newMessage)
      await userEvent.upload(fileInput, file, { applyAccept: false })
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
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
        [beneficiaires[1].id],
        ['liste-1'],
        file
      )
      expect(sendNouveauMessageGroupe).toHaveBeenCalledWith({
        idsBeneficiaires: [beneficiaires[1].id],
        idsListes: ['liste-1'],
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
        [beneficiaires[1].id],
        ['liste-1'],
        file
      )
      expect(sendNouveauMessageGroupe).toHaveBeenCalledWith({
        idsBeneficiaires: [beneficiaires[1].id],
        idsListes: ['liste-1'],
        newMessage:
          'Votre conseiller vous a transmis une nouvelle pièce jointe : ',
        cleChiffrement: 'cleChiffrement',
        infoPieceJointe: { id: 'id-fichier', nom: 'nom-fichier.png' },
      })
    })

    describe("affiche un message d'erreur en cas d'échec de l'upload de la pièce jointe", () => {
      let messageErreur: string
      beforeEach(async () => {
        // Given
        messageErreur = 'Le poids du document dépasse 5Mo'
        ;(uploadFichier as jest.Mock).mockRejectedValue(
          new ApiError(400, messageErreur)
        )

        // When
        await userEvent.click(submitButton)
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it('contenu', async () => {
        // Then
        expect(uploadFichier).toHaveBeenCalledTimes(1)
        expect(sendNouveauMessageGroupe).toHaveBeenCalledTimes(0)
        expect(screen.getByText(messageErreur)).toBeInTheDocument()
      })
    })
  })

  describe('quand on selectionne tout les bénéficiaires dans le champ de recherche', () => {
    it('sélectionne tout les bénéficiaires dans la liste', async () => {
      // When
      await userEvent.type(
        inputSearchBeneficiaire,
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
