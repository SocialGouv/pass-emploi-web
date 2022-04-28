import { render, screen } from '@testing-library/react'
import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'

import { Conseiller } from '../../interfaces/conseiller'
import { ConseillerService } from '../../services/conseiller.service'
import getByDefinitionTerm from '../querySelector'

import { unConseiller } from 'fixtures/conseiller'
import { mockedConseillerService } from 'fixtures/services'
import Profil, { getServerSideProps } from 'pages/profil'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Page Profil conseiller', () => {
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
      let conseiller: Conseiller
      let conseillerService: ConseillerService
      let actual: GetServerSidePropsResult<any>

      beforeEach(async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            accessToken: 'accessToken',
            user: { id: 'id-conseiller', structure: 'POLE_EMPLOI' },
          },
        })
        conseiller = unConseiller()
        conseillerService = mockedConseillerService({
          getConseiller: jest.fn(async () => conseiller),
        })
        ;(withDependance as jest.Mock).mockReturnValue(conseillerService)

        // When
        actual = await getServerSideProps({} as GetServerSidePropsContext)
      })

      it('récupère les informations du conseiller', () => {
        // Then
        expect(conseillerService.getConseiller).toHaveBeenCalledWith(
          'id-conseiller',
          'accessToken'
        )
        expect(actual).toMatchObject({ props: { conseiller } })
      })

      it('récupère la structure du conseiller', () => {
        // Then
        expect(actual).toMatchObject({
          props: { structureConseiller: 'POLE_EMPLOI' },
        })
      })
    })

    describe("quand le conseiller n'existe pas", () => {
      it('renvoie une erreur', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            accessToken: 'accessToken',
            user: { id: 'id-conseiller' },
          },
        })

        const conseillerService = mockedConseillerService({
          getConseiller: jest.fn(async () => undefined),
        })
        ;(withDependance as jest.Mock).mockReturnValue(conseillerService)

        // When
        let error
        try {
          await getServerSideProps({} as GetServerSidePropsContext)
        } catch (e) {
          error = e
        }
        expect(error).toBeInstanceOf(Error)
      })
    })
  })

  describe('client side', () => {
    describe('contenu', () => {
      beforeEach(() => {
        // When
        render(
          <Profil
            conseiller={unConseiller({
              email: 'nils.tavernier@mail.com',
              agence: { id: 'MLS3F', nom: 'MLS3F SAINT-LOUIS' },
            })}
            structureConseiller='POLE_EMPLOI'
          />
        )
      })

      it('affiche le titre de la page', () => {
        // Then
        expect(
          screen.getByRole('heading', { name: 'Profil' })
        ).toBeInTheDocument()
      })

      it('affiche les informations du conseiller', () => {
        // Then
        expect(screen.getByText('Nils Tavernier')).toBeInTheDocument()
        expect(getByDefinitionTerm('Votre e-mail')).toHaveTextContent(
          'nils.tavernier@mail.com'
        )
        expect(getByDefinitionTerm('Votre agence')).toHaveTextContent(
          'MLS3F SAINT-LOUIS'
        )
      })
    })

    describe('quand il manque des informations', () => {
      it("n'affiche pas les informations manquantes", () => {
        // When
        render(
          <Profil
            conseiller={unConseiller()}
            structureConseiller='POLE_EMPLOI'
          />
        )

        // Then
        expect(() =>
          screen.getByRole('term', { name: /Votre e-mail/ })
        ).toThrow()
        expect(() =>
          screen.getByRole('term', { name: /Votre agence/ })
        ).toThrow()
      })
    })

    describe('quand le conseiller est MILO', () => {
      it('affiche le label correspondant', () => {
        // When
        render(
          <Profil
            conseiller={unConseiller({
              agence: { id: 'MLS3F', nom: 'MLS3F SAINT-LOUIS' },
            })}
            structureConseiller='MILO'
          />
        )

        // Then
        expect(getByDefinitionTerm('Votre Mission locale')).toHaveTextContent(
          'MLS3F SAINT-LOUIS'
        )
      })
    })
  })
})
