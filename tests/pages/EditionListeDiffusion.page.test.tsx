import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
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
import { AlerteParam } from 'referentiel/alerteParam'
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
    let alerteSetter: (alert: AlerteParam | undefined) => void
    let routerPush: jest.Mock

    beforeEach(async () => {
      // Given - When
      alerteSetter = jest.fn()
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ push: routerPush })

      listesDeDiffusionService = mockedListesDeDiffusionService()

      beneficiaires = desItemsJeunes()
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
      beforeEach(async () => {
        const titreInput = screen.getByLabelText('* Titre')
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
            idsDestinataires: [beneficiaires[0].id, beneficiaires[2].id],
          })
        })

        it('redirige vers mes listes de diffusion', async () => {
          // Then
          expect(alerteSetter).toHaveBeenCalledWith(
            AlerteParam.creationListeDiffusion
          )
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
            pageTitle: 'Créer - Listes de diffusion - Portefeuille',
            pageHeader: 'Créer une nouvelle liste',
            returnTo: '/mes-jeunes/listes-de-diffusion',
            withoutChat: true,
          },
        })
      })
    })
  })
})
