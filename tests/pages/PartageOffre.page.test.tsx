import { render, screen, within } from '@testing-library/react'
import { GetServerSidePropsContext } from 'next/types'

import { desItemsJeunes } from 'fixtures/jeune'
import { unDetailOffre } from 'fixtures/offre'
import {
  mockedJeunesService,
  mockedOffresEmploiService,
} from 'fixtures/services'
import { BaseJeune, JeuneFromListe } from 'interfaces/jeune'
import { DetailOffreEmploi } from 'interfaces/offre-emploi'
import PartageOffre, {
  getServerSideProps,
} from 'pages/offres/[offre_id]/partage'
import { JeunesService } from 'services/jeunes.service'
import { OffresEmploiService } from 'services/offres-emploi.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Page Partage Offre', () => {
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

    describe("quand l'utilisateur est connecté", () => {
      let offre: DetailOffreEmploi
      let jeunes: JeuneFromListe[]
      let offresEmploiService: OffresEmploiService
      let jeunesService: JeunesService
      beforeEach(() => {
        // Given
        offre = unDetailOffre()
        jeunes = desItemsJeunes()
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: 'id-conseiller' },
            accessToken: 'accessToken',
          },
        })
        offresEmploiService = mockedOffresEmploiService({
          getOffreEmploiServerSide: jest.fn(async () => unDetailOffre()),
        })
        jeunesService = mockedJeunesService({
          getJeunesDuConseillerServerSide: jest.fn(async () =>
            desItemsJeunes()
          ),
        })
        ;(withDependance as jest.Mock).mockImplementation(
          (dependance: string) => {
            if (dependance === 'offresEmploiService') return offresEmploiService
            if (dependance === 'jeunesService') return jeunesService
          }
        )
      })

      it('charge la page avec les détails de l’offre', async () => {
        // When
        const actual = await getServerSideProps({
          query: { offre_id: 'offre-id' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(
          offresEmploiService.getOffreEmploiServerSide
        ).toHaveBeenCalledWith('offre-id', 'accessToken')
        expect(actual).toEqual({
          props: {
            offre,
            jeunes: expect.arrayContaining([]),
            pageTitle: 'Partager une offre',
            withoutChat: true,
          },
        })
      })

      it('charge les jeunes du conseiller', async () => {
        // When
        const actual = await getServerSideProps({
          query: { offre_id: 'offre-id' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(
          jeunesService.getJeunesDuConseillerServerSide
        ).toHaveBeenCalledWith('id-conseiller', 'accessToken')
        expect(actual).toMatchObject({ props: { jeunes } })
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

  describe('client side', () => {
    let offre: DetailOffreEmploi
    let jeunes: BaseJeune[]
    beforeEach(() => {
      offre = unDetailOffre()
      jeunes = desItemsJeunes()
      render(
        <PartageOffre
          offre={offre}
          jeunes={jeunes}
          pageTitle=''
          withoutChat={true}
        />
      )
    })

    it('affiche les informations de l’offre', () => {
      // Then
      expect(screen.getByText(offre.titre)).toBeInTheDocument()
      expect(screen.getByText('Offre n°' + offre.id)).toBeInTheDocument()
    })

    it('contient une liste pour choisir un ou plusieurs jeune', () => {
      // Given
      const etape = screen.getByRole('group', {
        name: 'Étape 1 Bénéficiaires :',
      })

      // Then
      const selectJeune = within(etape).getByRole('combobox', {
        name: 'Rechercher et ajouter des jeunes Nom et prénom',
      })
      const options = within(etape).getByRole('listbox', { hidden: true })

      expect(selectJeune).toHaveAttribute('aria-required', 'true')
      expect(selectJeune).toHaveAttribute('multiple', '')
      for (const jeune of jeunes) {
        const jeuneOption = within(options).getByRole('option', {
          name: `${jeune.nom} ${jeune.prenom}`,
          hidden: true,
        })
        expect(jeuneOption).toBeInTheDocument()
      }
    })
  })
})
