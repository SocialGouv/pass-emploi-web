import { act, fireEvent, screen } from '@testing-library/react'
import { desJeunes } from 'fixtures/jeune'
import { mockedJeunesService } from 'fixtures/services'
import { UserStructure } from 'interfaces/conseiller'
import { GetServerSidePropsContext } from 'next/types'
import Supervision, { getServerSideProps } from 'pages/supervision'
import React from 'react'
import { JeunesService } from 'services/jeunes.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { DIProvider } from 'utils/injectionDependances'
import renderWithSession from '../renderWithSession'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

afterAll(() => {
  jest.clearAllMocks()
})

describe('Supervision', () => {
  describe('quand le conseiller est superviseur', () => {
    let jeunesService: JeunesService
    beforeEach(async () => {
      // Given
      jeunesService = mockedJeunesService()
      // When
      renderWithSession(
        <DIProvider dependances={{ jeunesService }}>
          <Supervision withoutChat={true} />
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
        screen.getByLabelText('E-mail conseiller initial')
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
        screen.getByLabelText('E-mail conseiller initial')
      ).toBeInTheDocument()
    })

    describe('au clique pour rechercher le conseiller initial', () => {
      const emailConseillerInitial = 'conseiller@email.com'
      const idConseillerInitial = 'id-conseiller-initial'
      let emailInput: HTMLInputElement
      const jeunes = desJeunes()
      beforeEach(async () => {
        // GIVEN
        emailInput = screen.getByLabelText('E-mail conseiller initial')
        const submitRecherche = screen.getByTitle('Rechercher')
        ;(
          jeunesService.getJeunesDuConseillerParEmail as jest.Mock
        ).mockResolvedValue({ idConseiller: idConseillerInitial, jeunes })
        fireEvent.input(emailInput, {
          target: { value: emailConseillerInitial },
        })

        // WHEN
        await act(async () => {
          submitRecherche.click()
        })
      })

      it('récupère les jeunes du conseiller', async () => {
        // THEN
        expect(
          jeunesService.getJeunesDuConseillerParEmail
        ).toHaveBeenCalledWith(emailConseillerInitial, 'accessToken')
      })

      it('affiche les jeunes du conseiller', async () => {
        // THEN
        for (const jeune of jeunes) {
          expect(
            screen.getByText(`${jeune.lastName} ${jeune.firstName}`)
          ).toBeInTheDocument()
        }
      })

      describe('à la modification du mail du conseiller initial', () => {
        it('reset la recherche', async () => {
          // WHEN
          await act(async () => {
            fireEvent.change(emailInput, {
              target: { value: 'whatever' },
            })
          })

          // THEN
          for (const jeune of jeunes) {
            expect(() =>
              screen.getByText(`${jeune.firstName} ${jeune.lastName}`)
            ).toThrow()
          }
        })
      })

      describe('au clique pour reaffecter les jeunes', () => {
        it('réaffecte les jeunes', async () => {
          // GIVEN
          const emailConseillerDestination = 'destination@email.com'
          const destinationInput = screen.getByLabelText(
            'E-mail conseiller de destination'
          )
          const submitReaffecter = screen.getByText('Réaffecter les jeunes')

          // WHEN
          await act(async () => {
            fireEvent.input(destinationInput, {
              target: { value: emailConseillerDestination },
            })
          })
          await act(async () =>
            screen.getByText(jeunes[0].firstName, { exact: false }).click()
          )
          await act(async () =>
            screen.getByText(jeunes[2].firstName, { exact: false }).click()
          )
          await act(async () => submitReaffecter.click())

          // THEN
          expect(jeunesService.reaffecter).toHaveBeenCalledWith(
            idConseillerInitial,
            emailConseillerDestination,
            [jeunes[0].id, jeunes[2].id],
            'accessToken'
          )
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
        validSession: true,
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ notFound: true })
    })
  })
})
