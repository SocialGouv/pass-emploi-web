import { render, screen } from '@testing-library/react'
import { GetServerSidePropsContext } from 'next/types'

import { uneBaseJeune } from 'fixtures/jeune'
import { uneListeDeDiffusion } from 'fixtures/listes-de-diffusion'
import { mockedListesDeDiffusionService } from 'fixtures/services'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import ListesDiffusion from 'pages/mes-jeunes/listes-de-diffusion'
import { getServerSideProps } from 'pages/mes-jeunes/listes-de-diffusion'
import { ListesDeDiffusionService } from 'services/listes-de-diffusion.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Page Listes de Diffusion', () => {
  describe('client side', () => {
    describe('contenu', () => {
      it('afficher un lien pour créer une liste de diffusion', () => {
        // Given - When
        render(<ListesDiffusion listesDiffusion={[]} pageTitle='' />)

        // Then
        expect(
          screen.getByRole('link', { name: 'Créer une liste' })
        ).toHaveAttribute(
          'href',
          '/mes-jeunes/listes-de-diffusion/edition-liste'
        )
      })
    })

    describe('quand il n’y a pas de listes de diffusion', () => {
      it('affiche le message idoine', async () => {
        // Given - When
        render(<ListesDiffusion listesDiffusion={[]} pageTitle='' />)

        // Then
        expect(
          screen.getByText('Vous n’avez aucune liste de diffusion.')
        ).toBeInTheDocument()
      })
    })

    describe('quand il y a des listes de diffusion', () => {
      beforeEach(() => {
        // Given
        const listesDeDiffusion: ListeDeDiffusion[] = [
          uneListeDeDiffusion(),
          uneListeDeDiffusion({
            id: 'liste-2',
            beneficiaires: [
              { ...uneBaseJeune(), estDansLePortefeuille: false },
            ],
          }),
        ]

        // When
        render(
          <ListesDiffusion listesDiffusion={listesDeDiffusion} pageTitle='' />
        )
      })

      it('affiche les informations des listes', () => {
        // Then
        expect(screen.getAllByText('Liste export international')).toHaveLength(
          2
        )
        expect(screen.getAllByText('1 destinataire(s)')).toHaveLength(2)
        expect(
          screen.getByLabelText(
            'Un ou plusieurs bénéficiaires de cette liste ont été réaffectés temporairement.'
          )
        ).toBeInTheDocument()
      })

      it('affiche le nombre de listes', () => {
        // Then
        expect(screen.getByText('Listes (2)')).toBeInTheDocument()
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
      const listesDeDiffusionService: ListesDeDiffusionService =
        mockedListesDeDiffusionService({
          getListesDeDiffusion: jest.fn(async () => []),
        })
      ;(withDependance as jest.Mock).mockReturnValue(listesDeDiffusionService)

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(
        listesDeDiffusionService.getListesDeDiffusion
      ).toHaveBeenCalledWith('id-conseiller', 'access-token')
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
