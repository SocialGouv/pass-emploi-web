import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import renderWithSession from '../renderWithSession'

import { unDetailJeune } from 'fixtures/jeune'
import { mockedJeunesService } from 'fixtures/services'
import { DetailJeune } from 'interfaces/jeune'
import SuppressionJeune, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/suppression'
import { JeunesService } from 'services/jeunes.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { RequestError, UnexpectedError } from 'utils/httpClient'
import { DIProvider } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Suppression Jeune', () => {
  describe('server side', () => {
    it("vérifie que l'utilisateur est connecté", async () => {
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
      beforeEach(() => {
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: { accessToken: 'accessToken', user: { structure: 'MILO' } },
        })

        jeunesService = mockedJeunesService({
          supprimerJeune: jest.fn(() => Promise.resolve()),
        })
        ;(withDependance as jest.Mock).mockReturnValue(jeunesService)
      })

      describe("quand le jeune s'est déjà connecté", () => {
        let jeune: DetailJeune
        let actual: any
        beforeEach(async () => {
          // Given
          jeune = unDetailJeune({ isActivated: true })
          ;(jeunesService.getJeuneDetails as jest.Mock).mockResolvedValue(jeune)

          // When
          actual = await getServerSideProps({
            query: { jeune_id: jeune.id },
          } as unknown as GetServerSidePropsContext)
        })

        it('récupère le jeune', () => {
          // Then
          expect(jeunesService.getJeuneDetails).toHaveBeenCalledWith(
            jeune.id,
            'accessToken'
          )
        })

        it('renvoie sur la fiche du jeune', () => {
          // Then
          expect(actual).toEqual({
            redirect: {
              destination: `/mes-jeunes/${jeune.id}`,
              permanent: false,
            },
          })
        })
      })

      describe("quand le jeune ne s'est jamais connecté", () => {
        it('fournit le jeune à la page', async () => {
          // Given
          const jeune = unDetailJeune({ isActivated: false })
          ;(jeunesService.getJeuneDetails as jest.Mock).mockResolvedValue(jeune)

          // When
          const actual = await getServerSideProps({
            query: { jeune_id: jeune.id },
          } as unknown as GetServerSidePropsContext)

          // Then
          expect(actual).toEqual({
            props: {
              idJeune: jeune.id,
              withoutChat: true,
              pageTitle: 'Suppression - Kenji Jirac',
              pageHeader: 'Suppression de Kenji Jirac',
              returnTo: '/mes-jeunes/jeune-1',
            },
          })
        })
      })

      describe("quand le jeune n'existe pas", () => {
        it('redirige vers une erreur 404', async () => {
          // Give
          ;(jeunesService.getJeuneDetails as jest.Mock).mockResolvedValue(
            undefined
          )

          // When
          const actual = await getServerSideProps({
            query: { jeune_id: 'whatever' },
          } as unknown as GetServerSidePropsContext)

          // Then
          expect(actual).toEqual({ notFound: true })
        })
      })
    })
  })

  describe('client side', () => {
    let jeune: DetailJeune
    let jeunesService: JeunesService
    let push: Function
    beforeEach(() => {
      jeune = unDetailJeune({
        prenom: 'Nadia',
        nom: 'Sanfamiye',
        email: 'nadia.sanfamiye@email.fr',
      })
      jeunesService = mockedJeunesService()
      push = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({ push })

      renderWithSession(
        <DIProvider dependances={{ jeunesService }}>
          <SuppressionJeune
            idJeune={jeune.id}
            withoutChat={true}
            pageTitle=''
          />
        </DIProvider>
      )
    })

    it('prévient des effets de la suppression', () => {
      // Then
      expect(
        screen.getByText('Une fois confirmé', { exact: false })
      ).toBeInTheDocument()
    })

    it("permet d'annuler la suppression du jeune", () => {
      // Then
      const link: any = screen.getByText('Annuler')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', `/mes-jeunes/${jeune.id}`)
    })

    it('permet de confirmer la suppression du jeune', () => {
      // Then
      expect(screen.getByText('Confirmer')).toBeInTheDocument()
    })

    describe('suppression du jeune', () => {
      let button: HTMLButtonElement
      beforeEach(() => {
        button = screen.getByText('Confirmer')
      })

      describe('quand tout se passe bien', () => {
        beforeEach(async () => {
          await userEvent.click(button)
        })

        it('supprime le compte', () => {
          // Then
          expect(jeunesService.supprimerJeune).toHaveBeenCalledWith(
            jeune.id,
            'accessToken'
          )
        })

        it('redirige vers la liste des jeunes', () => {
          // Then
          expect(push).toHaveBeenCalledWith('/mes-jeunes?suppression=succes')
        })
      })

      describe('quand il y a une erreur', () => {
        it('affiche un message spécifique si la jeune a activé son compte', async () => {
          // Given
          ;(jeunesService.supprimerJeune as jest.Mock).mockRejectedValue(
            new RequestError("Message d'erreur", 'JEUNE_PAS_INACTIF')
          )

          // When
          await userEvent.click(button)

          // Then
          expect(
            screen.getByText('compte jeune activé', { exact: false })
          ).toBeInTheDocument()
          expect(push).not.toHaveBeenCalled()
        })

        it("affiche le message d'une erreur de requête", async () => {
          // Given
          ;(jeunesService.supprimerJeune as jest.Mock).mockRejectedValue(
            new RequestError("Message d'erreur")
          )

          // When
          await userEvent.click(button)

          // Then
          expect(screen.getByText("Message d'erreur")).toBeInTheDocument()
          expect(push).not.toHaveBeenCalled()
        })

        it("affiche un message d'erreur générique", async () => {
          // Given
          ;(jeunesService.supprimerJeune as jest.Mock).mockRejectedValue(
            new UnexpectedError("Message d'erreur")
          )

          // When
          await userEvent.click(button)

          // Then
          expect(
            screen.getByText('problème inconnu', { exact: false })
          ).toBeInTheDocument()
          expect(push).not.toHaveBeenCalled()
        })
      })
    })
  })
})
