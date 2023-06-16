import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import { desItemsJeunes } from 'fixtures/jeune'
import { StructureConseiller } from 'interfaces/conseiller'
import Reaffectation, {
  getServerSideProps,
} from 'pages/etablissement/reaffectation'
import {
  getConseillerServerSide,
  getConseillersEtablissementServerSide,
} from 'services/conseiller.service'
import {
  getJeunesDuConseillerParId,
  reaffecter,
} from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/jeunes.service')
jest.mock('services/conseiller.service')

describe('Reaffectation', () => {
  const conseillersEtablissement = [
    unConseiller({
      id: 'id-conseiller-initial',
      firstName: 'Albert',
      lastName: 'Durant',
      agence: { nom: 'agence-dijon', id: 'id-agence' },
      aDesBeneficiairesARecuperer: true,
      structure: StructureConseiller.MILO,
    }),
    unConseiller({
      id: 'id-conseiller-destination',
      firstName: 'Claude',
      lastName: 'Dupont',
      agence: { nom: 'agence-dijon', id: 'id-agence' },
      aDesBeneficiairesARecuperer: true,
      structure: StructureConseiller.MILO,
    }),
  ]

  describe('client side', () => {
    beforeEach(async () => {
      // When
      await act(() => {
        renderWithContexts(
          <Reaffectation
            withoutChat={true}
            pageTitle=''
            conseillersEtablissement={conseillersEtablissement}
          />
        )
      })
    })

    it('contient un champ pour sélectionner le type de réaffectation', () => {
      // When
      const typeReaffectation = screen.getByText(
        'Choisissez un type de réaffectation'
      )
      const typeReaffectionDefinitiveRadio = screen.getByLabelText('Définitif')
      const typeReaffectationTemporaireRadio =
        screen.getByLabelText('Temporaire')

      // Then
      expect(typeReaffectation).toBeInTheDocument()
      expect(typeReaffectionDefinitiveRadio).toBeInTheDocument()
      expect(typeReaffectationTemporaireRadio).toBeInTheDocument()
    })

    it("affiche un champ de recherche d'un conseiller initial", async () => {
      // THEN
      expect(screen.getByLabelText(/Conseiller initial/)).toBeInTheDocument()
    })

    it("affiche un bouton pour rechercher les jeunes d'un conseiller", async () => {
      // THEN
      expect(
        screen.getByText('Rechercher les bénéficiaires')
      ).toBeInTheDocument()
    })

    describe('au clic sur un type de réaffectation', () => {
      it('déclenche le changement de type de réaffectation', async () => {
        // Given
        const typeReaffectationRadio = screen.getByLabelText('Définitif')
        expect(
          screen.getByText('Choisissez un type de réaffectation')
        ).toBeInTheDocument()
        expect(typeReaffectationRadio).not.toBeChecked()

        // When
        await userEvent.click(typeReaffectationRadio)

        // Then
        expect(typeReaffectationRadio).toBeChecked()
      })
    })

    describe('au clic pour rechercher le conseiller initial', () => {
      const nomConseillerInitial = 'Albert Durant'
      const idConseillerInitial = 'id-conseiller-initial'
      let conseillerInitialInput: HTMLInputElement
      const jeunes = desItemsJeunes()
      beforeEach(async () => {
        // GIVEN
        conseillerInitialInput = screen.getByLabelText(/Conseiller initial/)
        const submitRecherche = screen.getByLabelText(
          'Rechercher les bénéficiaires'
        )
        ;(getJeunesDuConseillerParId as jest.Mock).mockResolvedValue(
          jeunes
        )
        await userEvent.click(screen.getByLabelText('Définitif'))
        await userEvent.type(conseillerInitialInput, nomConseillerInitial)

        // WHEN
        await userEvent.click(submitRecherche)
      })

      it('récupère les jeunes du conseiller', async () => {
        // THEN
        expect(getJeunesDuConseillerParId).toHaveBeenCalledWith(
          idConseillerInitial
        )
      })

      it('affiche les jeunes du conseiller', async () => {
        // THEN
        for (const jeune of jeunes) {
          expect(
            screen.getByText(`${jeune.nom} ${jeune.prenom}`)
          ).toBeInTheDocument()
        }
      })

      it('selectionne tous les jeunes au clic sur la checkbox', async () => {
        // Given
        const toutSelectionnerCheckbox = screen.getByLabelText(
          'Cocher tous les bénéficiaires'
        )
        expect(toutSelectionnerCheckbox).not.toBeChecked()

        // When
        await userEvent.click(toutSelectionnerCheckbox)

        // Then
        expect(toutSelectionnerCheckbox).toBeChecked()
      })

      it('affiche un champ de saisie du conseiller de destination', async () => {
        // THEN
        const inputDestination: HTMLElement = screen.getByLabelText(
          /Conseiller de destination/
        )
        expect(inputDestination).toBeInTheDocument()
      })

      it('afficher un bouton pour réaffecter les jeunes', async () => {
        // THEN
        const submitReaffectation: HTMLElement = screen.getByRole('button', {
          name: 'Réaffecter les jeunes',
        })
        expect(submitReaffectation).toBeInTheDocument()
      })

      describe('au reset du nom et prénom du conseiller initial', () => {
        it('vide le champ de saisie du nom et prénom', async () => {
          //When
          const inputSaisieConseillerInitial = screen
            .getByLabelText(/Conseiller initial/)
            .closest('div') as HTMLElement
          await userEvent.click(
            within(inputSaisieConseillerInitial).getByText(
              'Effacer le champ de saisie'
            )
          )
          // Then
          expect(screen.getByLabelText(/Conseiller initial/)).toHaveAttribute(
            'value',
            ''
          )
        })
      })

      describe('au reset du nom et prénom du conseiller destination', () => {
        it('vide le champ de saisie du nom et prénom', async () => {
          //When
          const inputSaisieConseillerDestination = screen
            .getByLabelText(/Conseiller de destination/)
            .closest('div') as HTMLElement
          await userEvent.click(
            within(inputSaisieConseillerDestination).getByText(
              'Effacer le champ de saisie'
            )
          )
          // Then
          expect(
            screen.getByLabelText(/Conseiller de destination/)
          ).toHaveAttribute('value', '')
        })
      })

      describe('à la modification du nom et prénom du conseiller initial', () => {
        it('reset de la liste des jeunes', async () => {
          // WHEN
          await userEvent.type(conseillerInitialInput, 'whatever')

          // THEN
          for (const jeune of jeunes) {
            expect(() =>
              screen.getByText(`${jeune.prenom} ${jeune.nom}`)
            ).toThrow()
          }
        })
      })

      describe('au clic pour reaffecter les jeunes', () => {
        it('réaffecte les jeunes', async () => {
          // GIVEN
          const nomEtPrenomConseillerDestination = 'Claude Dupont'
          const idConseillerDestination = 'id-conseiller-destination'
          const destinationInput = screen.getByLabelText(
            /Conseiller de destination/
          )
          const typeReaffectationRadio = screen.getByLabelText('Définitif')
          const estTemporaire = false
          const submitReaffecter = screen.getByText('Valider mon choix')

          // WHEN
          await userEvent.type(
            destinationInput,
            nomEtPrenomConseillerDestination
          )
          await userEvent.click(
            screen.getByText(jeunes[0].prenom, { exact: false })
          )
          await userEvent.click(
            screen.getByText(jeunes[2].prenom, { exact: false })
          )
          await userEvent.click(typeReaffectationRadio)
          await userEvent.click(submitReaffecter)

          // THEN
          expect(reaffecter).toHaveBeenCalledWith(
            idConseillerInitial,
            idConseillerDestination,
            [jeunes[0].id, jeunes[2].id],
            estTemporaire
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
        const actual = await getServerSideProps({
          query: { redirectUrl: '/etablissement' },
        } as GetServerSidePropsContext)

        // Then
        expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
        expect(actual).toEqual({ notFound: true })
      })
    })

    describe('quand le conseiller est superviseur', () => {
      it('prépare la page', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { estSuperviseur: true },
          },
        })
        ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
          conseillersEtablissement[0]
        )
        ;(getConseillersEtablissementServerSide as jest.Mock).mockResolvedValue(
          conseillersEtablissement
        )

        // When
        const actual = await getServerSideProps({
          query: { redirectUrl: '/etablissement' },
        } as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            pageTitle: 'Réaffectation',
            returnTo: '/etablissement',
            withoutChat: true,
            conseillersEtablissement: conseillersEtablissement,
          },
        })
      })
    })
  })
})
