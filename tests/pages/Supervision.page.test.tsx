import { fireEvent, screen } from '@testing-library/react'
import { UserStructure } from 'interfaces/conseiller'
import { GetServerSidePropsContext } from 'next/types'
import Supervision, { getServerSideProps } from 'pages/supervision'
import React from 'react'
import { JeunesService } from 'services/jeunes.service'
import { DIProvider } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import { desJeunes } from '../../fixtures/jeune'
import renderWithSession from '../renderWithSession'

jest.mock('utils/withMandatorySessionOrRedirect')

afterAll(() => {
  jest.clearAllMocks()
})

describe('Supervision', () => {
  describe('quand le conseiller est superviseur', () => {
    let jeunesService: JeunesService
    beforeEach(async () => {
      // Given
      jeunesService = {
        getJeunesDuConseiller: jest.fn(),
        getJeunesDuConseillerParEmail: jest.fn(),
        getJeuneDetails: jest.fn(),
        createCompteJeunePoleEmploi: jest.fn(),
      }

      // When
      renderWithSession(
        <DIProvider dependances={{ jeunesService }}>
          <Supervision />
        </DIProvider>,
        {
          user: {
            id: '1',
            name: 'Nils Tavernier',
            structure: UserStructure.POLE_EMPLOI,
            estSuperviseur: true,
          },
        }
      )
    })

    it('affiche le titre de la page', () => {
      //THEN
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Réaffectation des jeunes'
      )
    })

    it("affiche un champ de recherche d'un conseiller", async () => {
      // THEN
      expect(
        screen.getByLabelText('E-mail conseiller actuel')
      ).toBeInTheDocument()
    })

    it("affiche un bouton pour rechercher les jeunes d'un conseiller", async () => {
      // THEN
      expect(screen.getByTitle('Rechercher')).toBeInTheDocument()
    })

    it('affiche un champ de saisie du conseiller de destination', async () => {
      // THEN
      const inputDestination: HTMLElement = screen.getByLabelText(
        'E-mail conseiller de destination'
      )
      expect(inputDestination).toBeInTheDocument()
      expect(inputDestination).toHaveAttribute('disabled')
    })

    it('afficher un bouton pour réaffecter les jeunes', async () => {
      // THEN
      const submitReaffectation: HTMLElement = screen.getByRole('button', {
        name: 'Réaffecter les jeunes',
      })
      expect(submitReaffectation).toBeInTheDocument()
      expect(submitReaffectation).toHaveAttribute('disabled')
    })

    it("affiche un champ de recherche des jeunes d'un conseiller", async () => {
      // THEN
      expect(
        screen.getByLabelText('E-mail conseiller actuel')
      ).toBeInTheDocument()
    })

    describe('au clique pour rechercher le conseiller actuel', () => {
      const emailConseillerActuel = 'conseiller@email.com'
      let submitRecherche: any
      let emailInput: any
      const jeunes = desJeunes()
      beforeEach(async () => {
        // GIVEN
        emailInput = screen.getByLabelText('E-mail conseiller actuel')
        submitRecherche = screen.getByTitle('Rechercher')
        ;(
          jeunesService.getJeunesDuConseillerParEmail as jest.Mock
        ).mockResolvedValue(jeunes)
        fireEvent.input(emailInput, {
          target: { value: emailConseillerActuel },
        })

        // WHEN
        submitRecherche.click()
      })

      it('récupère les jeunes du conseiller', async () => {
        // THEN
        expect(
          jeunesService.getJeunesDuConseillerParEmail
        ).toHaveBeenCalledWith(emailConseillerActuel, 'accessToken')
      })

      it('affiche les jeunes du conseiller', async () => {
        // THEN
        jeunes.forEach((jeune) => {
          expect(screen.getByText(jeune.firstName)).toBeInTheDocument()
        })
      })
    })
  })

  describe("quand le conseiller n'est pas superviseur", () => {
    it('renvoie une page 404', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        session: {
          user: { estSuperviseur: false },
        },
        hasSession: true,
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ notFound: true })
    })
  })
})
