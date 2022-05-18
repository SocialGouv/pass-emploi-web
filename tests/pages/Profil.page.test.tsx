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

        // When
        actual = await getServerSideProps({} as GetServerSidePropsContext)
      })

      it('récupère la structure du conseiller', () => {
        // Then
        expect(actual).toEqual({
          props: {
            structureConseiller: 'POLE_EMPLOI',
            pageTitle: 'Mon profil',
            pageHeader: 'Profil',
          },
        })
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

      it("contient un champ pour sélectionner l'activation des notifications", () => {
        // When
        const toggleNotifications = getToggleNotifications()

        // Then
        expect(toggleNotifications).toBeInTheDocument()
        expect(toggleNotifications.checked).toEqual(
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

        const toggleNotifications = getToggleNotifications()

        // When
        await act(async () => {
          await toggleNotifications.click()
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
    })
  })
})

function getToggleNotifications() {
  return screen.getByRole<HTMLInputElement>('checkbox', {
    name: /notifications sonores/,
  })
}
