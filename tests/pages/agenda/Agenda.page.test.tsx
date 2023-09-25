import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import { StructureConseiller } from 'interfaces/conseiller'
import Agenda, { getServerSideProps } from 'pages/agenda'
import {
  getRendezVousConseiller,
  getRendezVousEtablissement,
} from 'services/evenements.service'
import {
  getSessionsBeneficiaires,
  getSessionsMissionLocaleClientSide,
} from 'services/sessions.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/evenements.service')
jest.mock('services/sessions.service')
jest.mock('components/PageActionsPortal')

describe('Agenda', () => {
  describe('client side', () => {
    let replace: jest.Mock
    const SEPTEMBRE_1_14H = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')

    beforeEach(async () => {
      // Given
      jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1_14H)
      replace = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({
        replace: replace,
        asPath: '/mes-jeunes',
      })
      ;(getRendezVousConseiller as jest.Mock).mockResolvedValue([])
      ;(getSessionsBeneficiaires as jest.Mock).mockResolvedValue([])
      ;(getRendezVousEtablissement as jest.Mock).mockResolvedValue([])
      ;(getSessionsMissionLocaleClientSide as jest.Mock).mockResolvedValue([])

      const conseiller = unConseiller({
        structure: StructureConseiller.MILO,
        agence: {
          nom: 'Mission Locale Aubenas',
          id: 'id-etablissement',
        },
        structureMilo: {
          nom: 'Mission Locale Aubenas',
          id: 'id-test',
        },
      })

      // When
      await act(async () => {
        renderWithContexts(<Agenda pageTitle='' />, {
          customConseiller: conseiller,
        })
      })
    })

    it('contient des liens créer pour des évènements', () => {
      const pageActionPortal = screen.getByTestId('page-action-portal')

      expect(
        within(pageActionPortal).getByRole('link', {
          name: 'Créer une animation collective',
        })
      ).toHaveAttribute('href', '/mes-jeunes/edition-rdv?type=ac')

      expect(
        within(pageActionPortal).getByRole('link', {
          name: 'Créer un rendez-vous',
        })
      ).toHaveAttribute('href', '/mes-jeunes/edition-rdv')
    })

    it('contient 2 onglets', () => {
      // Then
      expect(
        screen.getByRole('tab', { name: 'Mon agenda', selected: false })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('tab', {
          name: 'Agenda Mission Locale',
          selected: true,
        })
      ).toBeInTheDocument()
    })

    it('permet de changer d’onglet', async () => {
      // When
      await userEvent.click(
        screen.getByRole('tab', { name: 'Agenda Mission Locale' })
      )
      // Then
      expect(replace).toHaveBeenCalledWith(
        {
          pathname: '/agenda',
          query: { onglet: 'etablissement', periodeIndex: 0 },
        },
        undefined,
        { shallow: true }
      )
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Agenda Mission Locale'
      )
      expect(
        screen.getByRole('tabpanel', { name: 'Agenda Mission Locale' })
      ).toBeInTheDocument()
      expect(() =>
        screen.getByRole('tabpanel', { name: 'Mon agenda' })
      ).toThrow()

      // When
      await userEvent.click(
        screen.getByRole('tab', { name: 'Mon agenda' })
      )
      // Then
      expect(replace).toHaveBeenCalledWith(
        { pathname: '/agenda', query: { onglet: 'conseiller',periodeIndex: 0 } },
        undefined,
        { shallow: true }
      )
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Mon agenda'
      )
      expect(
        screen.getByRole('tabpanel', { name: 'Mon agenda' })
      ).toBeInTheDocument()
      expect(() =>
        screen.getByRole('tabpanel', {
          name: 'Agenda Mission Locale',
          periodeIndex: 0,
        })
      ).toThrow()
    })
  })

  describe('server side', () => {
    describe('Pour un conseiller Pôle Emploi', () => {
      it('renvoie une 404', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          session: {
            user: { structure: 'POLE_EMPLOI' },
          },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
        expect(actual).toEqual({ notFound: true })
      })
    })

    describe('quand le conseiller est connecté', () => {
      it('récupère les infos de la page', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: { user: { structure: 'MILO' } },
        })

        // When
        const actual = await getServerSideProps({
          query: { onglet: 'etablissement' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            pageTitle: 'Tableau de bord - Agenda',
            pageHeader: 'Agenda',
            onglet: 'ETABLISSEMENT',
          },
        })
      })
    })
  })
})
