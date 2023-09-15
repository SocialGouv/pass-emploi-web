import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsContext } from 'next/types'

import { desListesDeDiffusion } from 'fixtures/listes-de-diffusion'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import ListesDiffusion, {
  getServerSideProps,
} from 'pages/mes-jeunes/listes-de-diffusion'
import { getListesDeDiffusionServerSide } from 'services/listes-de-diffusion.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/listes-de-diffusion.service')
jest.mock('components/PageActionsPortal')

describe('Page Listes de Diffusion', () => {
  describe('client side', () => {
    describe('contenu', () => {
      it('afficher un lien pour créer une liste de diffusion', () => {
        // Given - When
        renderWithContexts(
          <ListesDiffusion listesDiffusion={[]} pageTitle='' />
        )
        const pageActionPortal = screen.getByTestId('page-action-portal')

        // Then
        expect(
          within(pageActionPortal).getByRole('link', {
            name: 'Créer une liste',
          })
        ).toHaveAttribute(
          'href',
          '/mes-jeunes/listes-de-diffusion/edition-liste'
        )
      })
    })

    describe('quand il n’y a pas de listes de diffusion', () => {
      beforeEach(() => {
        // Given - When
        renderWithContexts(
          <ListesDiffusion listesDiffusion={[]} pageTitle='' />
        )
      })

      it('affiche le message idoine', async () => {
        // Then
        expect(
          screen.getByText('Vous n’avez pas encore créé de liste de diffusion.')
        ).toBeInTheDocument()
      })

      it('affiche un empty state comprenant un lien pour créer une liste de diffusion', () => {
        const emptyState = screen.getByTestId('empty-state-liste-de-diffusion')

        // Then
        expect(
          within(emptyState).getByRole('link', {
            name: 'Créer une liste',
          })
        ).toHaveAttribute(
          'href',
          '/mes-jeunes/listes-de-diffusion/edition-liste'
        )
      })
    })

    describe('quand il y a des listes de diffusion', () => {
      let listesDeDiffusion: ListeDeDiffusion[]
      beforeEach(() => {
        // Given
        listesDeDiffusion = desListesDeDiffusion()
        // When
        renderWithContexts(
          <ListesDiffusion listesDiffusion={listesDeDiffusion} pageTitle='' />
        )
      })

      it('affiche les informations des listes', () => {
        // Then
        expect(
          screen.getByText('Liste export international')
        ).toBeInTheDocument()
        expect(screen.getByText('Liste métiers pâtisserie')).toBeInTheDocument()
        expect(screen.getAllByText('1 destinataire(s)')).toHaveLength(2)
        expect(
          screen.getByLabelText(
            'Un ou plusieurs bénéficiaires de cette liste ont été réaffectés temporairement.'
          )
        ).toBeInTheDocument()
      })

      it('permet de modifier la liste', () => {
        // Then
        listesDeDiffusion.forEach((liste) => {
          expect(
            screen.getByRole('row', {
              name: 'Consulter la liste ' + liste.titre,
            })
          ).toHaveAttribute(
            'href',
            '/mes-jeunes/listes-de-diffusion/edition-liste?idListe=' + liste.id
          )
        })
      })

      it('affiche le nombre de listes', () => {
        // Then
        expect(
          screen.getByRole('table', { name: 'Listes (2)' })
        ).toBeInTheDocument()
      })

      it('permet de trier les listes par ordre alphabétique inversé', async () => {
        // When
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Trier les listes de diffusion par ordre alphabétique inversé',
          })
        )

        // Then
        const [_header, ...listes] = screen.getAllByRole('row')
        expect(listes[0]).toHaveAccessibleName(
          new RegExp(listesDeDiffusion[1].titre)
        )
        expect(listes[1]).toHaveAccessibleName(
          new RegExp(listesDeDiffusion[0].titre)
        )
      })

      it('permet de trier les listes par ordre alphabétique', async () => {
        // When
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Trier les listes de diffusion par ordre alphabétique inversé',
          })
        )
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Trier les listes de diffusion par ordre alphabétique',
          })
        )

        // Then
        const [_header, ...listes] = screen.getAllByRole('row')
        expect(listes[0]).toHaveAccessibleName(
          new RegExp(listesDeDiffusion[0].titre)
        )
        expect(listes[1]).toHaveAccessibleName(
          new RegExp(listesDeDiffusion[1].titre)
        )
      })
    })
  })

  describe('server side', () => {
    it("vérifie qu'il y a un utilisateur connecté", async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: { destination: 'whatever' },
      })

      // When
      const actual = await getServerSideProps({
        query: {},
      } as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: { destination: 'whatever' } })
    })

    it('récupère les listes de diffusion', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: { accessToken: 'access-token', user: { id: 'id-conseiller' } },
      })
      ;(getListesDeDiffusionServerSide as jest.Mock).mockResolvedValue([])

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(getListesDeDiffusionServerSide).toHaveBeenCalledWith(
        'id-conseiller',
        'access-token'
      )
      expect(actual).toEqual({
        props: {
          pageTitle: 'Listes de diffusion - Portefeuille',
          pageHeader: 'Mes listes de diffusion',
          listesDiffusion: [],
        },
      })
    })
  })
})
