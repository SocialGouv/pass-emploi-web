import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'

import { unConseiller } from 'fixtures/conseiller'
import { mockedConseillerService } from 'fixtures/services'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import Profil, { getServerSideProps } from 'pages/profil'
import { ConseillerService } from 'services/conseiller.service'
import getByDefinitionTerm from 'tests/querySelector'
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

      it('charge la page avec les bonnes props', () => {
        // Then
        expect(actual).toEqual({
          props: {
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
          render(
            <DIProvider dependances={{ conseillerService }}>
              <ConseillerProvider conseiller={conseiller}>
                <Profil pageTitle='' />
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
          render(
            <DIProvider dependances={{ conseillerService }}>
              <ConseillerProvider conseiller={unConseiller()}>
                <Profil pageTitle='' />
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
          structure: StructureConseiller.MILO,
          agence: 'MLS3F SAINT-LOUIS',
        })

        // When
        await act(async () => {
          render(
            <DIProvider dependances={{ conseillerService }}>
              <ConseillerProvider conseiller={conseiller}>
                <Profil pageTitle='' />
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
          render(
            <DIProvider dependances={{ conseillerService }}>
              <ConseillerProvider conseiller={conseiller}>
                <Profil pageTitle='' />
              </ConseillerProvider>
            </DIProvider>
          )
        })

        const toggleNotifications = getToggleNotifications()

        // When
        await act(() => userEvent.click(toggleNotifications))
      })

      it('met à jour côté API', async () => {
        // Then
        expect(
          conseillerService.modifierNotificationsSonores
        ).toHaveBeenCalledWith(conseiller.id, !conseiller.notificationsSonores)
      })
    })
  })
})

function getToggleNotifications() {
  return screen.getByRole<HTMLInputElement>('checkbox', {
    name: /notifications sonores/,
  })
}
