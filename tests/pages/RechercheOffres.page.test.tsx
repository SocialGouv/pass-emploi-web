import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsContext } from 'next/types'

import { listeBaseOffres } from 'fixtures/offre'
import { mockedOffresEmploiService } from 'fixtures/services'
import { BaseOffreEmploi } from 'interfaces/offre-emploi'
import RechercheOffres, { getServerSideProps } from 'pages/recherche-offres'
import { OffresEmploiService } from 'services/offres-emploi.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('Page Recherche Offres', () => {
  describe('client side', () => {
    let offresEmploiService: OffresEmploiService
    let offresEmploi: BaseOffreEmploi[]
    beforeEach(() => {
      offresEmploi = listeBaseOffres()
      offresEmploiService = mockedOffresEmploiService({
        searchOffresEmploi: jest.fn().mockResolvedValue(offresEmploi),
      })

      renderWithContexts(<RechercheOffres pageTitle='' />, {
        customDependances: { offresEmploiService },
      })
    })

    it('permet de saisir des mots clés', () => {
      // Then
      expect(screen.getByLabelText(/Mots clés/)).toHaveAttribute('type', 'text')
    })

    it('n’affiche pas de résultat par défaut', () => {
      // Then
      expect(() => screen.getByText('Liste des résultats')).toThrow()
      expect(() => screen.getByRole('list')).toThrow()
    })

    it("permet de rechercher des offres d'emploi", async () => {
      // Given
      const submitButton = screen.getByRole('button', { name: 'Rechercher' })

      // When
      await userEvent.click(submitButton)

      // Then
      expect(offresEmploiService.searchOffresEmploi).toHaveBeenCalledWith({})
    })

    it('construit la recherche', async () => {
      // Given
      const inputMotsCles = screen.getByLabelText(/Mots clés/)
      const submitButton = screen.getByRole('button', { name: 'Rechercher' })

      // When
      await userEvent.type(inputMotsCles, 'prof industrie')
      await userEvent.click(submitButton)

      // Then
      expect(offresEmploiService.searchOffresEmploi).toHaveBeenCalledWith({
        motsCles: 'prof industrie',
      })
    })

    describe('résultat de la recherche', () => {
      let offresList: HTMLElement
      beforeEach(async () => {
        // Given
        const submitButton = screen.getByRole('button', { name: 'Rechercher' })

        // When
        await userEvent.click(submitButton)

        // Then
        offresList = screen.getByRole('list', {
          description: 'Liste des résultats',
        })
      })

      it('affiche toutes les offres', async () => {
        expect(within(offresList).getAllByRole('listitem').length).toEqual(
          offresEmploi.length
        )
      })

      it('affiche chaque offre', async () => {
        offresEmploi.forEach((offre) => {
          expect(within(offresList).getByText(offre.titre)).toBeInTheDocument()
          expect(
            within(offresList).getByText('Offre n°' + offre.id)
          ).toBeInTheDocument()
          expect(
            within(offresList).getByText(offre.typeContrat)
          ).toBeInTheDocument()
          expect(within(offresList).getByText(offre.duree)).toBeInTheDocument()
          expect(
            within(offresList).getByText(offre.nomEntreprise)
          ).toBeInTheDocument()
          expect(
            within(offresList).getByText(offre.localisation.nom)
          ).toBeInTheDocument()
        })
      })

      it('permet de partager chaque offre', () => {
        offresEmploi.forEach((offre) => {
          expect(
            within(offresList).getByRole('link', {
              name: `Partager offre numéro ${offre.id}`,
            })
          ).toHaveAttribute('href', `/offres/${offre.id}/partage`)
        })
      })
    })

    it('affiche une erreur si la recherche échoue', async () => {
      // Given
      ;(offresEmploiService.searchOffresEmploi as jest.Mock).mockRejectedValue(
        'whatever'
      )

      // When
      const submitButton = screen.getByRole('button', { name: 'Rechercher' })
      await userEvent.click(submitButton)

      // Then
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Une erreur est survenue/
      )
    })

    it("affiche un message s'il n'y a pas de résultat", async () => {
      // Given
      ;(offresEmploiService.searchOffresEmploi as jest.Mock).mockResolvedValue(
        []
      )

      // When
      const submitButton = screen.getByRole('button', { name: 'Rechercher' })
      await userEvent.click(submitButton)

      // Then
      expect(
        screen.getByText(
          'Aucune offre ne correspond à vos critères de recherche.'
        )
      )
    })
  })

  describe('server side', () => {
    it('requiert la connexion', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: { destination: 'whatever' },
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: { destination: 'whatever' } })
    })

    it('charge la page avec les bonnes props', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
      })

      // When
      const actual = await getServerSideProps({
        query: {},
      } as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({
        props: {
          pageTitle: 'Recherche d’offres',
          pageHeader: 'Offres',
        },
      })
    })

    it('récupère la réussite du partage', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
      })

      // When
      const actual = await getServerSideProps({
        query: { partageOffre: 'succes' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({
        props: {
          pageTitle: 'Recherche d’offres',
          pageHeader: 'Offres',
          partageSuccess: true,
        },
      })
    })
  })
})
