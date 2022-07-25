import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { unDossierMilo } from 'fixtures/milo'
import { mockedConseillerService } from 'fixtures/services'
import MiloCreationJeune from 'pages/mes-jeunes/milo/creation-jeune'
import renderWithContexts from 'tests/renderWithContexts'

describe('MiloCreationJeune', () => {
  describe("quand le dossier n'a pas encore été saisi", () => {
    beforeEach(() => {
      renderWithContexts(
        <MiloCreationJeune
          dossierId=''
          dossier={null}
          erreurMessageHttpMilo=''
          pageTitle=''
        />
      )
    })

    it('devrait afficher le champ de recherche de dossier', () => {
      //THEN
      expect(screen.getByText("Création d'un compte jeune")).toBeInTheDocument()
      expect(
        screen.getByText(
          'Saisissez le numéro de dossier du jeune pour lequel vous voulez créer un compte'
        )
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Numéro de dossier')).toBeInTheDocument()
    })

    it("quand on soumet la recherche avec une valeur vide, affiche un message d'erreur", async () => {
      //GIVEN
      const submitButton = screen.getByRole('button', {
        name: 'Valider le numéro',
      })
      const inputSearch = screen.getByLabelText('Numéro de dossier')
      await userEvent.clear(inputSearch)

      //WHEN
      await userEvent.click(submitButton)

      //THEN
      expect(
        screen.getByText('Veuillez renseigner un numéro de dossier')
      ).toBeInTheDocument()
    })
  })

  describe('quand le dossier a été saisi', () => {
    it("quand le dossier est invalide avec un message d'erreur", () => {
      //GIVEN
      const messageErreur = "un message d'erreur"
      renderWithContexts(
        <MiloCreationJeune
          dossierId='1'
          dossier={null}
          erreurMessageHttpMilo={messageErreur}
          pageTitle=''
        />
      )

      //THEN
      expect(screen.getByText(messageErreur)).toBeInTheDocument()
    })
  })

  describe('quand on clique sur le bouton créer un compte', () => {
    it("devrait afficher les informations de succès de création d'un compte", async () => {
      //GIVEN
      const conseillerService = mockedConseillerService({
        createCompteJeuneMilo: jest.fn((_) => Promise.resolve({ id: 'un-id' })),
      })

      const dossier = unDossierMilo()

      renderWithContexts(
        <MiloCreationJeune
          dossierId='1'
          dossier={dossier}
          erreurMessageHttpMilo={''}
          pageTitle=''
        />,
        { customDependances: { conseillerService } }
      )

      //WHEN
      const createCompteButton = screen.getByRole('button', {
        name: 'Créer le compte',
      })

      await userEvent.click(createCompteButton)

      //THEN

      expect(conseillerService.createCompteJeuneMilo).toHaveBeenCalledWith({
        email: 'kenji-faux-mail@mail.com',
        idDossier: '1234',
        nom: 'GIRAC',
        prenom: 'Kenji',
      })

      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: 'Ajouter un jeune',
          })
        ).toBeInTheDocument()

        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Le compte jeune a été créé avec succès.',
          })
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            'Vous pouvez désormais le retrouver dans l\'onglet "Mes jeunes"'
          )
        ).toBeInTheDocument()

        expect(
          screen.getByRole('link', {
            name: 'Accéder à la fiche du jeune',
          })
        ).toBeInTheDocument()

        expect(
          screen.getByRole('link', {
            name: 'Accéder à la fiche du jeune',
          })
        ).toHaveAttribute('href', '/mes-jeunes/un-id')
      })
    })

    it("devrait afficher un message d'erreur en cas de création de compte en échec", async () => {
      //GIVEN
      const conseillerService = mockedConseillerService({
        createCompteJeuneMilo: jest.fn((_) =>
          Promise.reject({ message: "un message d'erreur" })
        ),
      })

      const dossier = unDossierMilo({ email: 'incorrectemail' })

      renderWithContexts(
        <MiloCreationJeune
          dossierId='1'
          dossier={dossier}
          erreurMessageHttpMilo={''}
          pageTitle=''
        />,
        { customDependances: { conseillerService } }
      )

      //WHEN
      const createCompteButton = screen.getByRole('button', {
        name: 'Créer le compte',
      })

      await userEvent.click(createCompteButton)

      //THEN
      expect(conseillerService.createCompteJeuneMilo).toHaveBeenCalledTimes(1)
      expect(screen.getByText("un message d'erreur")).toBeInTheDocument()
    })
  })
})
