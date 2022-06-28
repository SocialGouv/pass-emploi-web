import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import renderWithSession from '../renderWithSession'

import { desItemsJeunes } from 'fixtures/jeune'
import { mockedJeunesService } from 'fixtures/services'
import { UserStructure } from 'interfaces/conseiller'
import Reaffectation, { getServerSideProps } from 'pages/reaffectation'
import { JeunesService } from 'services/jeunes.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { DIProvider } from 'utils/injectionDependances'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('Reaffectation', () => {
  describe('client side', () => {
    let jeunesService: JeunesService
    beforeEach(async () => {
      // Given
      jeunesService = mockedJeunesService()
      // When
      renderWithSession(
        <DIProvider dependances={{ jeunesService }}>
          <Reaffectation withoutChat={true} pageTitle='' />
        </DIProvider>,
        {
          user: {
            id: '1',
            name: 'Nils Tavernier',
            structure: UserStructure.POLE_EMPLOI,
            estSuperviseur: true,
            email: 'fake@email.com',
            estConseiller: true,
          },
        }
      )
    })

    it('affiche les 4 étapes de réaffectation', async () => {
      const listeEtapesReaffectation = screen.getByRole('list', {
        name: 'Étapes pour la réaffectation',
      })
      // THEN
      expect(listeEtapesReaffectation).toBeInTheDocument()
      const { getAllByRole } = within(listeEtapesReaffectation)
      const items = getAllByRole('listitem')
      expect(items.length).toBe(4)
    })

    it('contient un champ pour sélectionner le type de réaffectation', () => {
      // When
      const typeReaffectation = screen.getByRole('group', {
        name: 'Type de réaffectation',
      })
      const typeReaffectionDefinitiveRadio = screen.getByLabelText('Définitif')
      const typeReaffectationTemporaireRadio =
        screen.getByLabelText('Temporaire')

      // Then
      expect(typeReaffectation).toBeInTheDocument()
      expect(typeReaffectionDefinitiveRadio).toBeInTheDocument()
      expect(typeReaffectationTemporaireRadio).toBeInTheDocument()
    })

    it("affiche un champ de recherche d'un conseiller", async () => {
      // THEN
      expect(
        screen.getByLabelText('* E-mail conseiller initial')
      ).toBeInTheDocument()
    })

    it("affiche un bouton pour rechercher les jeunes d'un conseiller", async () => {
      // THEN
      expect(screen.getByTitle('Rechercher')).toBeInTheDocument()
    })

    it('affiche un champ de saisie du conseiller de destination', async () => {
      // THEN
      const inputDestination: HTMLElement = screen.getByLabelText(
        '* E-mail conseiller de destination'
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
        screen.getByLabelText('* E-mail conseiller initial')
      ).toBeInTheDocument()
    })

    describe('au clic sur un type de réaffectation', () => {
      it('déclenche le changement de type de réaffectation', async () => {
        // Given
        const typeReaffectationRadio = screen.getByLabelText('Définitif')
        expect(
          screen.getByRole('group', { name: 'Type de réaffectation' })
        ).toBeInTheDocument()
        expect(typeReaffectationRadio).not.toBeChecked()

        // When
        fireEvent.click(typeReaffectationRadio)

        // Then
        expect(typeReaffectationRadio).toBeChecked()
      })
    })

    describe('au clique pour rechercher le conseiller initial', () => {
      const emailConseillerInitial = 'conseiller@email.com'
      const idConseillerInitial = 'id-conseiller-initial'
      let emailInput: HTMLInputElement
      const jeunes = desItemsJeunes()
      beforeEach(async () => {
        // GIVEN
        emailInput = screen.getByLabelText('* E-mail conseiller initial')
        const submitRecherche = screen.getByTitle('Rechercher')
        ;(
          jeunesService.getJeunesDuConseillerParEmail as jest.Mock
        ).mockResolvedValue({ idConseiller: idConseillerInitial, jeunes })
        fireEvent.input(emailInput, {
          target: { value: emailConseillerInitial },
        })

        // WHEN
        await userEvent.click(submitRecherche)
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
            screen.getByText(`${jeune.nom} ${jeune.prenom}`)
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
              screen.getByText(`${jeune.prenom} ${jeune.nom}`)
            ).toThrow()
          }
        })
      })

      describe('au clique pour reaffecter les jeunes', () => {
        it('réaffecte les jeunes', async () => {
          // GIVEN
          const emailConseillerDestination = 'destination@email.com'
          const destinationInput = screen.getByLabelText(
            '* E-mail conseiller de destination'
          )
          const typeReaffectationRadio = screen.getByLabelText('Définitif')
          const estTemporaire = false
          const submitReaffecter = screen.getByText('Réaffecter les jeunes')

          // WHEN
          await act(async () => {
            fireEvent.input(destinationInput, {
              target: { value: emailConseillerDestination },
            })
          })
          await userEvent.click(
            screen.getByText(jeunes[0].prenom, { exact: false })
          )
          await userEvent.click(
            screen.getByText(jeunes[2].prenom, { exact: false })
          )
          await act(async () => typeReaffectationRadio.click())
          await userEvent.click(submitReaffecter)

          // THEN
          expect(jeunesService.reaffecter).toHaveBeenCalledWith(
            idConseillerInitial,
            emailConseillerDestination,
            [jeunes[0].id, jeunes[2].id],
            estTemporaire,
            'accessToken'
          )
        })
      })
    })
  })

  describe('server side', () => {
    describe("quand le conseiller n'est pas superviseur", () => {
      it('renvoie une page 404', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          session: { user: { estSuperviseur: false } },
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

  describe('quand le conseiller est superviseur', () => {
    it('prépare la page', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: { user: { estSuperviseur: true } },
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({
        props: {
          pageTitle: 'Réaffectation',
          pageHeader: 'Réaffectation des jeunes',
        },
      })
    })
  })
})
