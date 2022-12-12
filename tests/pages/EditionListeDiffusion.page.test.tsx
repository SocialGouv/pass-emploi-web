import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import { desItemsJeunes } from 'fixtures/jeune'
import { uneListeDeDiffusion } from 'fixtures/listes-de-diffusion'
import {
  mockedJeunesService,
  mockedListesDeDiffusionService,
} from 'fixtures/services'
import { BaseJeune, getNomJeuneComplet, JeuneFromListe } from 'interfaces/jeune'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import EditionListeDiffusion, {
  getServerSideProps,
} from 'pages/mes-jeunes/listes-de-diffusion/edition-liste'
import { AlerteParam } from 'referentiel/alerteParam'
import { JeunesService } from 'services/jeunes.service'
import { ListesDeDiffusionService } from 'services/listes-de-diffusion.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/injectionDependances/withDependance')
jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('components/Modal')

describe('Page d’édition d’une liste de diffusion', () => {
  describe('client side', () => {
    let beneficiaires: BaseJeune[]
    let listesDeDiffusionService: ListesDeDiffusionService
    let alerteSetter: (alert: AlerteParam | undefined) => void
    let routerPush: jest.Mock

    beforeEach(async () => {
      // Given - When
      alerteSetter = jest.fn()
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ push: routerPush })

      listesDeDiffusionService = mockedListesDeDiffusionService()

      beneficiaires = desItemsJeunes()
    })

    describe('contenu', () => {
      beforeEach(() => {
        renderWithContexts(
          <EditionListeDiffusion
            beneficiaires={beneficiaires}
            pageTitle=''
            returnTo='/mes-jeunes/listes-de-diffusion'
          />,
          {
            customDependances: { listesDeDiffusionService },
            customAlerte: { alerteSetter },
          }
        )
      })

      it('affiche le formulaire', () => {
        // Then
        expect(
          screen.getByRole('textbox', {
            name: 'Titre Exemple : Ma liste de pâtissier',
          })
        ).toHaveProperty('required', true)
        expect(
          screen.getByRole('combobox', { name: /des bénéficiaires/ })
        ).toHaveAttribute('aria-required', 'true')

        expect(
          screen.getByRole('button', { name: 'Créer la liste' })
        ).toBeInTheDocument()

        expect(screen.getByRole('link', { name: 'Annuler' })).toHaveAttribute(
          'href',
          '/mes-jeunes/listes-de-diffusion'
        )
      })

      describe('formulaire rempli', () => {
        beforeEach(async () => {
          const titreInput = screen.getByLabelText(/\* Titre/)
          const destinatairesSelect = screen.getByLabelText(/des bénéficiaires/)
          const creationButton = screen.getByRole('button', {
            name: 'Créer la liste',
          })

          // Given
          await userEvent.type(titreInput, 'Liste métiers aéronautique')
          await userEvent.type(
            destinatairesSelect,
            getNomJeuneComplet(beneficiaires[0])
          )
          await userEvent.type(
            destinatairesSelect,
            getNomJeuneComplet(beneficiaires[2])
          )

          // When
          await userEvent.click(creationButton)
        })

        describe('quand le formulaire est validé', () => {
          it('crée la liste', async () => {
            // Then
            expect(
              listesDeDiffusionService.creerListeDeDiffusion
            ).toHaveBeenCalledWith({
              titre: 'Liste métiers aéronautique',
              idsBeneficiaires: [beneficiaires[0].id, beneficiaires[2].id],
            })
          })

          it('redirige vers mes listes de diffusion', async () => {
            // Then
            expect(routerPush).toHaveBeenCalledWith(
              '/mes-jeunes/listes-de-diffusion'
            )
          })

          it('affiche un message de succès', async () => {
            // Then
            expect(alerteSetter).toHaveBeenCalledWith(
              AlerteParam.creationListeDiffusion
            )
          })
        })

        it('est désactivé quand le titre n’est pas renseigné', async () => {
          // Given
          await userEvent.clear(screen.getByLabelText(/\* Titre/))
          // Then
          expect(
            screen.getByRole('button', {
              name: 'Créer la liste',
            })
          ).toHaveAttribute('disabled', '')
        })

        it('est désactivé quand aucun destinataire n’est renseigné', async () => {
          // Given
          const enleverBeneficiaires: HTMLButtonElement[] =
            screen.getAllByText(/Enlever/)

          // When
          for (const bouton of enleverBeneficiaires) {
            await userEvent.click(bouton)
          }
          // Then
          expect(
            screen.getByRole('button', {
              name: 'Créer la liste',
            })
          ).toHaveAttribute('disabled', '')
          expect(
            screen.getByText(
              'Aucun bénéficiaire n’est renseigné. Veuillez sélectionner au moins un bénéficiaire.'
            )
          ).toBeInTheDocument()
        })

        it('affiche un message d’erreur si la création échoue', async () => {
          // Given
          ;(
            listesDeDiffusionService.creerListeDeDiffusion as jest.Mock
          ).mockRejectedValue({})

          // When
          await userEvent.click(screen.getByText('Créer la liste'))

          // Then
          expect(
            screen.getByText(
              'Une erreur s’est produite, veuillez réessayer ultérieurement.'
            )
          ).toBeInTheDocument()
        })
      })
    })

    describe('modification', () => {
      let listeDeDiffusion: ListeDeDiffusion
      beforeEach(() => {
        // When
        const jeune0 = {
          id: beneficiaires[0].id,
          prenom: beneficiaires[0].prenom,
          nom: beneficiaires[0].nom,
          estDansLePortefeuille: true,
        }
        const jeune2 = {
          id: 'id-2',
          prenom: 'Jacques',
          nom: 'Chirac',
          estDansLePortefeuille: false,
        }
        listeDeDiffusion = uneListeDeDiffusion({
          beneficiaires: [jeune0, jeune2],
        })
        renderWithContexts(
          <EditionListeDiffusion
            beneficiaires={beneficiaires}
            pageTitle=''
            returnTo='/mes-jeunes/listes-de-diffusion'
            liste={listeDeDiffusion}
          />,
          {
            customDependances: { listesDeDiffusionService },
            customAlerte: { alerteSetter },
          }
        )
      })

      it('permet de supprimer la liste', async () => {
        // When
        await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
        await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

        // Then
        expect(
          listesDeDiffusionService.supprimerListeDeDiffusion
        ).toHaveBeenCalledWith(listeDeDiffusion.id)
        expect(alerteSetter).toHaveBeenCalledWith(
          AlerteParam.suppressionListeDiffusion
        )
        expect(routerPush).toHaveBeenCalledWith(
          '/mes-jeunes/listes-de-diffusion'
        )
      })

      it('charge les bénéficiaires de la liste', () => {
        // Then
        const jeune0Fullname = getNomJeuneComplet(beneficiaires[0])
        const jeune2Fullname = 'Chirac Jacques'
        expect(() =>
          screen.getByRole('option', {
            name: jeune0Fullname,
            hidden: true,
          })
        ).toThrow()
        expect(() =>
          screen.getByRole('option', {
            name: jeune2Fullname,
            hidden: true,
          })
        ).toThrow()

        const destinataires = screen.getByRole('region', {
          name: /Bénéficiaires/,
        })
        expect(
          within(destinataires).getByText(jeune0Fullname)
        ).toBeInTheDocument()
        expect(
          within(destinataires).getByText(jeune2Fullname)
        ).toBeInTheDocument()
        expect(
          within(destinataires).getByLabelText(
            'Ce bénéficiaire a été réaffecté temporairement à un autre conseiller'
          )
        ).toBeInTheDocument()
      })

      it('charge le titre de la liste', () => {
        // When
        expect(screen.getByLabelText(/Titre/)).toHaveValue(
          listeDeDiffusion.titre
        )
      })

      it('contient un lien pour annuler', async () => {
        // Then
        expect(screen.getByText('Annuler la modification')).toHaveAttribute(
          'href',
          '/mes-jeunes/listes-de-diffusion'
        )
      })

      it('ne permet pas de modifier tant qu’il n’y a pas de changement', () => {
        //Then
        expect(screen.getByText('Modifier la liste')).toBeDisabled()
      })

      describe('liste modifiée', () => {
        beforeEach(async () => {
          // Given
          const inputTitre = screen.getByLabelText(/Titre/)
          await userEvent.clear(inputTitre)
          await userEvent.type(inputTitre, 'Nouveau titre')

          await userEvent.click(
            screen.getByText(/Enlever beneficiaire Chirac Jacques/)
          )
          await userEvent.type(
            screen.getByLabelText(/des bénéficiaires/),
            getNomJeuneComplet(beneficiaires[1])
          )

          // When
          await userEvent.click(
            screen.getByRole('button', { name: 'Modifier la liste' })
          )
        })

        it('modifie la liste', async () => {
          // Then
          expect(
            listesDeDiffusionService.modifierListeDeDiffusion
          ).toHaveBeenCalledWith(listeDeDiffusion.id, {
            titre: 'Nouveau titre',
            idsBeneficiaires: [beneficiaires[0].id, beneficiaires[1].id],
          })
        })

        it('affiche un message de succès', async () => {
          // Then
          expect(alerteSetter).toHaveBeenCalledWith(
            AlerteParam.modificationListeDiffusion
          )
        })

        it('redirige vers mes listes de diffusion', async () => {
          // Then
          expect(routerPush).toHaveBeenCalledWith(
            '/mes-jeunes/listes-de-diffusion'
          )
        })
      })
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

    describe("quand l'utilisateur est connecté", () => {
      let jeunesService: JeunesService
      let listesDeDiffusionService: ListesDeDiffusionService
      let jeunes: JeuneFromListe[]
      let listeDeDiffusion: ListeDeDiffusion

      beforeEach(() => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: 'id-conseiller' },
            accessToken: 'accessToken',
          },
        })

        jeunes = desItemsJeunes()
        listeDeDiffusion = uneListeDeDiffusion()
        jeunesService = mockedJeunesService({
          getJeunesDuConseillerServerSide: jest.fn().mockResolvedValue(jeunes),
        })
        listesDeDiffusionService = mockedListesDeDiffusionService({
          recupererListeDeDiffusion: jest
            .fn()
            .mockResolvedValue(listeDeDiffusion),
        })
        ;(withDependance as jest.Mock).mockImplementation((dependance) => {
          if (dependance === 'jeunesService') return jeunesService
          if (dependance === 'listesDeDiffusionService')
            return listesDeDiffusionService
        })
      })

      it('récupère la liste des jeunes du conseiller', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: {},
        } as GetServerSidePropsContext)

        // Then
        expect(
          jeunesService.getJeunesDuConseillerServerSide
        ).toHaveBeenCalledWith('id-conseiller', 'accessToken')
        expect(actual).toEqual({
          props: {
            beneficiaires: [jeunes[2], jeunes[0], jeunes[1]],
            pageTitle: 'Créer - Listes de diffusion - Portefeuille',
            pageHeader: 'Créer une nouvelle liste',
            returnTo: '/mes-jeunes/listes-de-diffusion',
            withoutChat: true,
          },
        })
      })

      it('récupère la liste de diffusion concernée', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: { idListe: '1' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(
          listesDeDiffusionService.recupererListeDeDiffusion
        ).toHaveBeenCalledWith('1', 'accessToken')

        expect(actual).toMatchObject({
          props: {
            pageTitle: 'Modifier - Listes de diffusion - Portefeuille',
            liste: listeDeDiffusion,
          },
        })
      })
    })
  })
})
