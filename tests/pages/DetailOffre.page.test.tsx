import { screen } from '@testing-library/react'

import renderWithContexts from '../renderWithContexts'

import DetailOffre, { getServerSideProps } from 'pages/offres/[offre_id]'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { GetServerSidePropsContext } from 'next/types'
import { DetailOffreEmploi } from 'interfaces/offre-emploi'
import { unDetailOffre } from 'fixtures/offre'
import { mockedOffresEmploiService } from 'fixtures/services'
import withDependance from 'utils/injectionDependances/withDependance'
import { OffresEmploiService } from 'services/offres-emploi.service'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Page Détail Offre', () => {
  describe('client side', () => {
    let offre: DetailOffreEmploi

    it('affiche les informations détaillées de l’offre', () => {
      // TODO séparé en plusieurs it  / section heading
      // Given
      offre = unDetailOffre()

      // When
      renderWithContexts(
        <DetailOffre
          offre={offre}
          pageTitle={'Détail de l’offre'}
          returnTo={'/return/to'}
        />
      )

      // Then
      expect(screen.getByText(offre.dateActualisation)).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: offre.titre,
        })
      ).toBeInTheDocument()
      expect(screen.getByText(offre.nomEntreprise)).toBeInTheDocument()
      expect(screen.getByText(offre.localisation)).toBeInTheDocument()
      expect(screen.getByText(offre.typeContratLibelle)).toBeInTheDocument()
      expect(screen.getByText(offre.salaire)).toBeInTheDocument()
      expect(screen.getByText(offre.horaires)).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Détail de l’offre',
        })
      ).toBeInTheDocument()
      expect(screen.getByText(offre.description)).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Profil souhaité',
        })
      ).toBeInTheDocument()
      expect(screen.getByText(offre.experiences)).toBeInTheDocument()
      offre.competences.map((competence) => {
        expect(screen.getByText(competence)).toBeInTheDocument()
      })
      offre.competencesProfessionnelles.map((competencePro) => {
        expect(screen.getByText(competencePro)).toBeInTheDocument()
      })
      offre.formations.map((uneFormation) => {
        expect(screen.getByText(uneFormation)).toBeInTheDocument()
      })
      offre.langues.map((uneLangues) => {
        expect(screen.getByText(uneLangues)).toBeInTheDocument()
      })
      offre.permis.map((unPermis) => {
        expect(screen.getByText(unPermis)).toBeInTheDocument()
      })
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Entreprise',
        })
      ).toBeInTheDocument()
    })
  })

  describe('server side', () => {
    let offresEmploiService: OffresEmploiService
    beforeEach(() => {
      offresEmploiService = mockedOffresEmploiService({
        getOffreEmploiServerSide: jest.fn(async () => unDetailOffre()),
      })
    })

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

    it('charge la page avec les détails de l’offre', async () => {
      // Given
      const offre: DetailOffreEmploi = unDetailOffre()
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: {
          accessToken: 'accessToken',
        },
      })
      ;(withDependance as jest.Mock).mockImplementation(
        (dependance: string) => {
          if (dependance === 'offresEmploiService') return offresEmploiService
        }
      )

      // When
      const actual = await getServerSideProps({
        query: { offre_id: 'id-offre' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(offresEmploiService.getOffreEmploiServerSide).toHaveBeenCalledWith(
        'id-offre',
        'accessToken'
      )
      expect(actual).toEqual({
        props: {
          offre,
          pageTitle: 'Détail de l‘offre',
          pageHeader: 'Offre n°id-offre',
        },
      })
    })

    it("renvoie une 404 si l'offre n'existe pas", async () => {
      // Given
      ;(
        offresEmploiService.getOffreEmploiServerSide as jest.Mock
      ).mockResolvedValue(undefined)

      // When
      const actual = await getServerSideProps({
        query: { offre_id: 'offre-id' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({ notFound: true })
    })
  })
})
