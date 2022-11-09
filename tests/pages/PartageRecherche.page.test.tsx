import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { desItemsJeunes } from 'fixtures/jeune'
import {
  mockedJeunesService,
  mockedSuggestionsService,
} from 'fixtures/services'
import { JeuneFromListe } from 'interfaces/jeune'
import { TypeOffre } from 'interfaces/offre'
import PartageCritere, {
  getServerSideProps,
} from 'pages/offres/partage-recherche'
import { JeunesService } from 'services/jeunes.service'
import { SuggestionsService } from 'services/suggestions.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Partage Recherche', () => {
  const TITRE = 'Prof - Marseille 06'
  const MOTS_CLES = 'Prof'
  const LABEL_METIER = 'Professeur'
  const CODE_METIER = 'K2107'
  const LABEL_LOCALITE = 'Marseille 06'
  const TYPE_LOCALITE = 'COMMUNE'
  const CODE_LOCALITE = '13006'
  const LATITUDE = '43.365355'
  const LONGITUDE = '5.321875'

  describe('server side', () => {
    it('requiert une session valide', async () => {
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

    describe('quand l’utilisateur est connecté', () => {
      let jeunes: JeuneFromListe[]
      let jeunesService: JeunesService
      beforeEach(() => {
        // Given
        jeunes = desItemsJeunes()
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: 'id-conseiller' },
            accessToken: 'accessToken',
          },
        })
        jeunesService = mockedJeunesService({
          getJeunesDuConseillerServerSide: jest.fn(async () =>
            desItemsJeunes()
          ),
        })
        ;(withDependance as jest.Mock).mockReturnValue(jeunesService)
      })

      it('charge les jeunes du conseiller', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: { referer: 'referer-url' } },
          query: { offre_type: 'emploi', offre_id: 'offre-id' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(
          jeunesService.getJeunesDuConseillerServerSide
        ).toHaveBeenCalledWith('id-conseiller', 'accessToken')
        expect(actual).toMatchObject({ props: { jeunes } })
      })

      it('charge la page avec les détails de suggestion d’offre d’emploi', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: { referer: 'referer-url' } },
          query: {
            type: TypeOffre.EMPLOI,
            titre: TITRE,
            motsCles: MOTS_CLES,
            typeLocalite: TYPE_LOCALITE,
            labelLocalite: LABEL_LOCALITE,
            codeLocalite: CODE_LOCALITE,
          },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            jeunes: expect.arrayContaining([]),
            type: TypeOffre.EMPLOI,
            criteresRecherche: {
              titre: TITRE,
              motsCles: MOTS_CLES,
              typeLocalite: TYPE_LOCALITE,
              labelLocalite: LABEL_LOCALITE,
              codeLocalite: CODE_LOCALITE,
            },
            withoutChat: true,
            returnTo: 'referer-url',
            pageTitle: 'Partager une recherche',
          },
        })
      })

      it('charge la page avec les détails de suggestion d’immersion', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: { referer: 'referer-url' } },
          query: {
            type: TypeOffre.IMMERSION,
            titre: TITRE,
            labelMetier: LABEL_METIER,
            codeMetier: CODE_METIER,
            labelLocalite: LABEL_LOCALITE,
            latitude: LATITUDE,
            longitude: LONGITUDE,
          },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            jeunes: expect.arrayContaining([]),
            type: TypeOffre.IMMERSION,
            criteresRecherche: {
              titre: TITRE,
              labelMetier: LABEL_METIER,
              codeMetier: CODE_METIER,
              labelLocalite: LABEL_LOCALITE,
              latitude: LATITUDE,
              longitude: LONGITUDE,
            },
            withoutChat: true,
            returnTo: 'referer-url',
            pageTitle: 'Partager une recherche',
          },
        })
      })

      it('charge la page avec les détails de suggestion de service civique', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: { referer: 'referer-url' } },
          query: {
            type: TypeOffre.SERVICE_CIVIQUE,
            titre: TITRE,
            labelLocalite: LABEL_LOCALITE,
            latitude: LATITUDE,
            longitude: LONGITUDE,
          },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            jeunes: expect.arrayContaining([]),
            type: TypeOffre.SERVICE_CIVIQUE,
            criteresRecherche: {
              titre: TITRE,
              labelLocalite: LABEL_LOCALITE,
              latitude: LATITUDE,
              longitude: LONGITUDE,
            },
            withoutChat: true,
            returnTo: 'referer-url',
            pageTitle: 'Partager une recherche',
          },
        })
      })
    })
  })

  describe('client side', () => {
    let suggestionsService: SuggestionsService
    let inputSearchJeune: HTMLSelectElement
    let submitButton: HTMLButtonElement
    let push: Function

    describe('pour tous les partages de recherche', () => {
      beforeEach(() => {
        suggestionsService = mockedSuggestionsService()

        renderWithContexts(
          <PartageCritere
            pageTitle='Partager une recherche'
            jeunes={desItemsJeunes()}
            type={TypeOffre.EMPLOI}
            criteresRecherche={{
              titre: TITRE,
              motsCles: MOTS_CLES,
              typeLocalite: TYPE_LOCALITE,
              labelLocalite: LABEL_LOCALITE,
              codeLocalite: CODE_LOCALITE,
            }}
            withoutChat={true}
            returnTo=''
          />,
          { customDependances: { suggestionsService: suggestionsService } }
        )

        //Given
        inputSearchJeune = screen.getByRole('combobox', {
          name: 'Rechercher et ajouter des jeunes Nom et prénom',
        })

        submitButton = screen.getByRole('button', {
          name: 'Envoyer',
        })
      })

      describe("quand le formulaire n'a pas encore été soumis", () => {
        it('devrait afficher les champs pour envoyer un message', () => {
          // Then
          expect(inputSearchJeune).toBeInTheDocument()
          expect(
            screen.getByRole('button', { name: 'Envoyer' })
          ).toBeInTheDocument()
          expect(
            screen.getByRole('link', { name: 'Annuler' })
          ).toBeInTheDocument()
        })

        it('ne devrait pas pouvoir cliquer sur le bouton envoyer sans avoir selectionner de destinataires', async () => {
          // Then
          expect(inputSearchJeune.selectedOptions).toBe(undefined)
          expect(submitButton).toHaveAttribute('disabled')
        })
      })

      describe('quand on remplit le formulaire', () => {
        beforeEach(async () => {
          push = jest.fn(() => Promise.resolve())
          ;(useRouter as jest.Mock).mockReturnValue({ push })

          // Given
          await userEvent.type(inputSearchJeune, 'Jirac Kenji')
          await userEvent.type(inputSearchJeune, 'Sanfamiye Nadia')
        })

        it('sélectionne plusieurs jeunes dans la liste', () => {
          // Then
          expect(screen.getByText('Jirac Kenji')).toBeInTheDocument()
          expect(screen.getByText('Sanfamiye Nadia')).toBeInTheDocument()
          expect(screen.getByText('Destinataires (2)')).toBeInTheDocument()
        })

        it('redirige vers la page précédente', async () => {
          // When
          await userEvent.click(submitButton)

          // Then
          expect(push).toHaveBeenCalledWith({
            pathname: '/recherche-offres',
            query: { suggestionRecherche: 'succes' },
          })
        })
      })
    })

    describe('pour le partage de recherche d’un type d’offre particulier', () => {
      describe('Offre Emploi', () => {
        beforeEach(() => {
          // Given
          renderWithContexts(
            <PartageCritere
              pageTitle='Partager une recherche'
              jeunes={desItemsJeunes()}
              type={TypeOffre.EMPLOI}
              criteresRecherche={{
                titre: TITRE,
                motsCles: MOTS_CLES,
                typeLocalite: TYPE_LOCALITE,
                labelLocalite: LABEL_LOCALITE,
                codeLocalite: CODE_LOCALITE,
              }}
              withoutChat={true}
              returnTo=''
            />,
            { customDependances: { suggestionsService: suggestionsService } }
          )

          //Given
          inputSearchJeune = screen.getByRole('combobox', {
            name: 'Rechercher et ajouter des jeunes Nom et prénom',
          })

          submitButton = screen.getByRole('button', {
            name: 'Envoyer',
          })
        })

        it("affiche les informations de la suggestion d’offre d'emploi", () => {
          expect(screen.getByText('Offre d’emploi')).toBeInTheDocument()
          expect(screen.getByText(TITRE)).toBeInTheDocument()
          expect(screen.getByText(MOTS_CLES)).toBeInTheDocument()
          expect(screen.getByText(LABEL_LOCALITE)).toBeInTheDocument()
        })

        it('envoie une suggestion d’offres d’emploi à plusieurs destinataires', async () => {
          // Given
          push = jest.fn(() => Promise.resolve())
          ;(useRouter as jest.Mock).mockReturnValue({ push })
          await userEvent.type(inputSearchJeune, 'Jirac Kenji')
          await userEvent.type(inputSearchJeune, 'Sanfamiye Nadia')

          // When
          await userEvent.click(submitButton)

          // Then
          expect(
            suggestionsService.envoyerSuggestionOffreEmploi
          ).toHaveBeenCalledWith({
            idsJeunes: ['jeune-1', 'jeune-2'],
            titre: TITRE,
            motsCles: MOTS_CLES,
            labelLocalite: LABEL_LOCALITE,
            codeCommune: CODE_LOCALITE,
          })
        })
      })

      describe('Immersion', () => {
        beforeEach(() => {
          // Given
          renderWithContexts(
            <PartageCritere
              pageTitle='Partager une recherche'
              jeunes={desItemsJeunes()}
              type={TypeOffre.IMMERSION}
              criteresRecherche={{
                titre: TITRE,
                labelMetier: LABEL_METIER,
                codeMetier: CODE_METIER,
                labelLocalite: LABEL_LOCALITE,
                latitude: LATITUDE,
                longitude: LONGITUDE,
              }}
              withoutChat={true}
              returnTo=''
            />,
            { customDependances: { suggestionsService: suggestionsService } }
          )

          //Given
          inputSearchJeune = screen.getByRole('combobox', {
            name: 'Rechercher et ajouter des jeunes Nom et prénom',
          })

          submitButton = screen.getByRole('button', {
            name: 'Envoyer',
          })
        })

        it('affiche les informations de la suggestion d’immersion', () => {
          expect(screen.getByText('Immersion')).toBeInTheDocument()
          expect(screen.getByText(TITRE)).toBeInTheDocument()
          expect(screen.getByText(LABEL_METIER)).toBeInTheDocument()
          expect(screen.getByText(LABEL_LOCALITE)).toBeInTheDocument()
        })

        it('envoie une suggestion d’immersion à plusieurs destinataires', async () => {
          // Given
          push = jest.fn(() => Promise.resolve())
          ;(useRouter as jest.Mock).mockReturnValue({ push })
          await userEvent.type(inputSearchJeune, 'Jirac Kenji')
          await userEvent.type(inputSearchJeune, 'Sanfamiye Nadia')

          // When
          await userEvent.click(submitButton)

          // Then
          expect(
            suggestionsService.envoyerSuggestionImmersion
          ).toHaveBeenCalledWith({
            idsJeunes: ['jeune-1', 'jeune-2'],
            titre: TITRE,
            labelMetier: LABEL_METIER,
            codeMetier: CODE_METIER,
            labelLocalite: LABEL_LOCALITE,
            latitude: Number(LATITUDE),
            longitude: Number(LONGITUDE),
          })
        })
      })

      describe('Service Civique', () => {
        beforeEach(() => {
          // Given
          renderWithContexts(
            <PartageCritere
              pageTitle='Partager une recherche'
              jeunes={desItemsJeunes()}
              type={TypeOffre.SERVICE_CIVIQUE}
              criteresRecherche={{
                titre: TITRE,
                labelLocalite: LABEL_LOCALITE,
                latitude: LATITUDE,
                longitude: LONGITUDE,
              }}
              withoutChat={true}
              returnTo=''
            />,
            { customDependances: { suggestionsService: suggestionsService } }
          )

          //Given
          inputSearchJeune = screen.getByRole('combobox', {
            name: 'Rechercher et ajouter des jeunes Nom et prénom',
          })

          submitButton = screen.getByRole('button', {
            name: 'Envoyer',
          })
        })

        it('affiche les informations de la suggestion de service civique', () => {
          expect(screen.getByText('Service civique')).toBeInTheDocument()
          expect(screen.getByText(TITRE)).toBeInTheDocument()
          expect(screen.getByText(LABEL_LOCALITE)).toBeInTheDocument()
        })

        it('envoie une suggestion de service civique à plusieurs destinataires', async () => {
          // Given
          push = jest.fn(() => Promise.resolve())
          ;(useRouter as jest.Mock).mockReturnValue({ push })
          await userEvent.type(inputSearchJeune, 'Jirac Kenji')
          await userEvent.type(inputSearchJeune, 'Sanfamiye Nadia')

          // When
          await userEvent.click(submitButton)

          // Then
          expect(
            suggestionsService.envoyerSuggestionServiceCivique
          ).toHaveBeenCalledWith({
            idsJeunes: ['jeune-1', 'jeune-2'],
            titre: TITRE,
            labelLocalite: LABEL_LOCALITE,
            latitude: Number(LATITUDE),
            longitude: Number(LONGITUDE),
          })
        })
      })
    })
  })
})
