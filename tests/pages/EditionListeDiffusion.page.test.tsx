import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsContext } from 'next/types'

import { desItemsJeunes } from 'fixtures/jeune'
import {
  mockedJeunesService,
  mockedListesDeDiffusionService,
} from 'fixtures/services'
import { BaseJeune, getNomJeuneComplet, JeuneFromListe } from 'interfaces/jeune'
import EditionListeDiffusion, {
  getServerSideProps,
} from 'pages/mes-jeunes/listes-de-diffusion/edition-liste'
import { JeunesService } from 'services/jeunes.service'
import { ListesDeDiffusionService } from 'services/listes-de-diffusion.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/injectionDependances/withDependance')
jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('Page d’édition d’une liste de diffusion', () => {
  describe('client side', () => {
    let beneficiaires: BaseJeune[]
    let listesDeDiffusionService: ListesDeDiffusionService
    beforeEach(async () => {
      // Given - When
      listesDeDiffusionService = mockedListesDeDiffusionService()

      beneficiaires = desItemsJeunes()
      renderWithContexts(
        <EditionListeDiffusion beneficiaires={beneficiaires} />,
        { customDependances: { listesDeDiffusionService } }
      )
    })

    it('affiche le formulaire', () => {
      // Then
      expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveProperty(
        'required',
        true
      )
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
      describe('quand le formulaire est validé', () => {
        it('crée la liste', async () => {
          // Given
          await userEvent.type(
            screen.getByLabelText('* Titre'),
            'Liste métiers aéronautique'
          )
          await userEvent.type(
            screen.getByLabelText(/des bénéficiaires/),
            getNomJeuneComplet(beneficiaires[0])
          )
          await userEvent.type(
            screen.getByLabelText(/des bénéficiaires/),
            getNomJeuneComplet(beneficiaires[2])
          )

          // When
          await userEvent.click(
            screen.getByRole('button', { name: 'Créer la liste' })
          )

          // Then
          expect(
            listesDeDiffusionService.creerListeDeDiffusion
          ).toHaveBeenCalledWith({
            titre: 'Liste métiers aéronautique',
            idsDestinataires: [beneficiaires[0].id, beneficiaires[2].id],
          })
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
      let jeunes: JeuneFromListe[]
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
        jeunesService = mockedJeunesService({
          getJeunesDuConseillerServerSide: jest.fn().mockResolvedValue(jeunes),
        })
        ;(withDependance as jest.Mock).mockReturnValue(jeunesService)
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
          },
        })
      })
    })
  })
})
