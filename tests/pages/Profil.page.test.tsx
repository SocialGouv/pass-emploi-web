import { act, screen } from '@testing-library/react'
import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'

import { unConseiller } from 'fixtures/conseiller'
import { mockedConseillerService } from 'fixtures/services'
import { Conseiller } from 'interfaces/conseiller'
import Profil, { getServerSideProps } from 'pages/profil'
import { ConseillerService } from 'services/conseiller.service'
import getByDefinitionTerm from 'tests/querySelector'
import renderWithSession from 'tests/renderWithSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { DIProvider } from 'utils/injectionDependances'
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
          props: {
            structureConseiller: 'POLE_EMPLOI',
            pageTitle: 'Mon profil',
          },
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
    let conseillerService: ConseillerService
    let conseiller: Conseiller

    beforeEach(() => {
      conseillerService = mockedConseillerService()
    })
    describe('contenu', () => {
      beforeEach(async () => {
        // Given
        conseiller = unConseiller({
          email: 'nils.tavernier@mail.com',
          agence: 'MLS3F SAINT-LOUIS',
        })

        // When
        await act(async () => {
          renderWithSession(
            <DIProvider dependances={{ conseillerService }}>
              <ConseillerProvider conseiller={conseiller}>
                <Profil structureConseiller='POLE_EMPLOI' pageTitle='' />
              </ConseillerProvider>
            </DIProvider>
          )
        })
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

      it("contient un champs pour sélectionner l'activation des notifications", () => {
        // When
        const toggleNotification =
          screen.getByRole<HTMLInputElement>('checkbox')

        // Then
        expect(toggleNotification).toBeInTheDocument()
        expect(toggleNotification.checked).toEqual(
          conseiller.notificationsSonores
        )
      })
    })

    describe('quand il manque des informations', () => {
      it("n'affiche pas les informations manquantes", async () => {
        // When
        await act(async () => {
          renderWithSession(
            <DIProvider dependances={{ conseillerService }}>
              <ConseillerProvider conseiller={unConseiller()}>
                <Profil structureConseiller='POLE_EMPLOI' pageTitle='' />
              </ConseillerProvider>
            </DIProvider>
          )
        })

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
      it('affiche le label correspondant', async () => {
        // Given
        const conseiller = unConseiller({
          email: 'nils.tavernier@mail.com',
          agence: 'MLS3F SAINT-LOUIS',
        })

        // When
        await act(async () => {
          renderWithSession(
            <DIProvider dependances={{ conseillerService }}>
              <ConseillerProvider conseiller={conseiller}>
                <Profil structureConseiller='MILO' pageTitle='' />
              </ConseillerProvider>
            </DIProvider>
          )
        })

        // Then
        expect(getByDefinitionTerm('Votre Mission locale')).toHaveTextContent(
          'MLS3F SAINT-LOUIS'
        )
      })
    })

    describe('quand on change le paramétrage des notifications', () => {
      beforeEach(async () => {
        // Given
        const conseiller = unConseiller({
          notificationsSonores: false,
        })

        await act(async () => {
          renderWithSession(
            <DIProvider dependances={{ conseillerService }}>
              <ConseillerProvider conseiller={conseiller}>
                <Profil structureConseiller='POLE_EMPLOI' pageTitle='' />
              </ConseillerProvider>
            </DIProvider>
          )
        })

        const toggleNotification =
          screen.getByRole<HTMLInputElement>('checkbox')

        // When
        await act(async () => {
          await toggleNotification.click()
        })
      })
      it('met à jour côté API', async () => {
        // Then
        expect(
          conseillerService.modifierNotificationsSonores
        ).toHaveBeenCalledWith(
          conseiller.id,
          !conseiller.notificationsSonores,
          'accessToken'
        )
      })
      it('met à jour le conseiller', async () => {
        // Then
        expect(
          conseillerService.modifierNotificationsSonores
        ).toHaveBeenCalledWith(
          conseiller.id,
          !conseiller.notificationsSonores,
          'accessToken'
        )
      })
    })
  })
})
