import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'

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
      // Then
      expect(
        screen.getByText(
          'Saisissez le numéro de dossier du jeune pour lequel vous voulez créer un compte'
        )
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Numéro de dossier')).toBeInTheDocument()
    })

    it("quand on soumet la recherche avec une valeur vide, affiche un message d'erreur", async () => {
      // Given
      const submitButton = screen.getByRole('button', {
        name: 'Valider le numéro',
      })
      const inputSearch = screen.getByLabelText('Numéro de dossier')
      await userEvent.clear(inputSearch)

      // When
      await userEvent.click(submitButton)

      // Then
      expect(
        screen.getByText('Veuillez renseigner un numéro de dossier')
      ).toBeInTheDocument()
    })
  })

  describe('quand le dossier a été saisi', () => {
    it("quand le dossier est invalide avec un message d'erreur", () => {
      // Given
      const messageErreur = "un message d'erreur"
      renderWithContexts(
        <MiloCreationJeune
          dossierId='1'
          dossier={null}
          erreurMessageHttpMilo={messageErreur}
          pageTitle=''
        />
      )

      // Then
      expect(screen.getByText(messageErreur)).toBeInTheDocument()
    })
  })

  describe('quand on clique sur le bouton créer un compte', () => {
    it('devrait revenir sur la page des jeunes du conseiller', async () => {
      // Given
      const conseillerService = mockedConseillerService({
        createCompteJeuneMilo: jest.fn((_) => Promise.resolve({ id: 'un-id' })),
      })
      const push = jest.fn(() => Promise.resolve())
      const setAlerte = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ push })

      const dossier = unDossierMilo()

      renderWithContexts(
        <MiloCreationJeune
          dossierId='1'
          dossier={dossier}
          erreurMessageHttpMilo={''}
          pageTitle=''
        />,
        {
          customDependances: { conseillerService },
          customAlerte: { alerteSetter: setAlerte },
        }
      )

      // When
      const createCompteButton = screen.getByRole('button', {
        name: 'Créer le compte',
      })

      await userEvent.click(createCompteButton)

      // Then
      expect(conseillerService.createCompteJeuneMilo).toHaveBeenCalledWith({
        email: 'kenji-faux-mail@mail.com',
        idDossier: '1234',
        nom: 'GIRAC',
        prenom: 'Kenji',
      })

      expect(setAlerte).toHaveBeenCalledWith('creationBeneficiaire', 'un-id')
      expect(push).toHaveBeenCalledWith('/mes-jeunes')
    })

    it("devrait afficher un message d'erreur en cas de création de compte en échec", async () => {
      // Given
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

      // When
      const createCompteButton = screen.getByRole('button', {
        name: 'Créer le compte',
      })

      await userEvent.click(createCompteButton)

      // Then
      expect(conseillerService.createCompteJeuneMilo).toHaveBeenCalledTimes(1)
      expect(screen.getByText("un message d'erreur")).toBeInTheDocument()
    })
  })
})
