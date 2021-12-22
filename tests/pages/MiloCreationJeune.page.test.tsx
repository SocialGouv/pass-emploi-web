import {
  act,
  fireEvent,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import renderWithSession from '../renderWithSession'
import MiloCreationJeune from 'pages/mes-jeunes/milo/creation-jeune'
import { unDossierMilo } from 'fixtures/milo'
import { ConseillerService } from 'services/conseiller.service'
import { DIProvider } from 'utils/injectionDependances'

jest.mock('next/router')

describe('MiloCreationJeune', () => {
  describe("quand le dossier n'a pas encore été saisi", () => {
    beforeEach(() => {
      renderWithSession(
        <MiloCreationJeune
          dossierId=''
          dossier={null}
          erreurMessageHttpMilo=''
        />
      )
    })

    it('devrait afficher le champ de recherche de dossier', () => {
      //THEN
      expect(screen.getByText("Création d'un compte jeune")).toBeInTheDocument
      expect(
        screen.getByText(
          'Saisissez le numéro de dossier du jeune pour lequel vous voulez créer un compte'
        )
      ).toBeInTheDocument
      expect(screen.getByLabelText('Numéro de dossier')).toBeInTheDocument
    })

    it("quand on soumet la recherche avec une valeur vide, affiche un message d'erreur", () => {
      //GIVEN
      const submitButton = screen.getByRole('button', {
        name: 'Valider le numéro',
      })
      const inputSearch = screen.getByLabelText('Numéro de dossier')
      fireEvent.change(inputSearch, { target: { value: '' } })

      //WHEN
      fireEvent.click(submitButton)

      //THEN
      expect(screen.getByText('Veuillez remplir le champ')).toBeInTheDocument
    })
  })

  describe('quand le dossier a été saisi', () => {
    it("quand le dossier est invalide avec un message d'erreur", () => {
      //GIVEN
      const messageErreur = "un message d'erreur"
      renderWithSession(
        <MiloCreationJeune
          dossierId='1'
          dossier={null}
          erreurMessageHttpMilo={messageErreur}
        />
      )

      //THEN
      expect(screen.getByText(messageErreur)).toBeInTheDocument()
    })
  })
  describe('quand on clique sur le bouton créer un compte', () => {
    let page: RenderResult
    let conseillerService: ConseillerService
    it("devrait afficher les informations de succès de création d'un compte", async () => {
      //GIVEN
      conseillerService = {
        getDossierJeune: jest.fn(),
        createCompteJeuneMilo: jest.fn((_) => Promise.resolve({ id: 'un-id' })),
      }

      const dossier = unDossierMilo()

      page = renderWithSession(
        <DIProvider conseillerService={conseillerService}>
          <MiloCreationJeune
            dossierId='1'
            dossier={dossier}
            erreurMessageHttpMilo={''}
          />
        </DIProvider>
      )

      //WHEN
      const createCompteButton = screen.getByRole('button', {
        name: 'Créer le compte',
      })

      fireEvent.click(createCompteButton)

      //THEN
      await waitFor(() => {
        expect(conseillerService.createCompteJeuneMilo).toHaveBeenCalledTimes(1)
      })

      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Le compte jeune a été créé avec succès.',
        })
      ).toBeInTheDocument()

      expect(
        screen.getByText(
          "Vous pouvez désormais le retrouver dans l'onglet mes jeunes"
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

    it("devrait afficher un message d'erreur en cas de création de compte en échec", async () => {
      //GIVEN
      conseillerService = {
        getDossierJeune: jest.fn(),
        createCompteJeuneMilo: jest.fn((_) =>
          Promise.reject({ message: "un message d'erreur" })
        ),
      }

      const dossier = unDossierMilo({ email: 'incorrectemail' })

      page = renderWithSession(
        <DIProvider conseillerService={conseillerService}>
          <MiloCreationJeune
            dossierId='1'
            dossier={dossier}
            erreurMessageHttpMilo={''}
          />
        </DIProvider>
      )

      //WHEN
      const createCompteButton = screen.getByRole('button', {
        name: 'Créer le compte',
      })

      fireEvent.click(createCompteButton)

      //THEN
      await waitFor(() => {
        expect(conseillerService.createCompteJeuneMilo).toHaveBeenCalledTimes(1)
      })

      expect(screen.getByText("un message d'erreur")).toBeInTheDocument()
    })
  })
})
