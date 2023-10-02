import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import { Conseiller } from 'interfaces/conseiller'
import { getServerSideProps } from 'pages/consentement-cgu'
import ConsentementCgu from 'pages/consentement-cgu'
import {
  getConseillerServerSide,
  modifierDateSignatureCGU,
} from 'services/conseiller.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'
import { DateTime } from 'luxon'

jest.mock('services/conseiller.service')
jest.mock('utils/auth/withMandatorySessionOrRedirect')

jest.mock('next/router')

describe('ConsentementCGU', () => {
  describe('client side', () => {
    let conseiller: Conseiller
    let routerPush: Function

    beforeEach(async () => {
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        push: routerPush,
      })

      // Given
      conseiller = unConseiller()
      act(() => {
        renderWithContexts(
          <ConsentementCgu
            accessToken='accessToken'
            conseiller={conseiller}
            returnTo='/mes-jeunes'
          />
        )
      })
    })

    it('Affiche le formulaire de consentement aux CGU', () => {})
    it('Affiche un message d’erreur quand le conseiller ne donne pas son consentement', async () => {
      // When
      await userEvent.click(screen.getByRole('button', { name: /Valider/ }))

      // Then
      expect(
        screen.getByText(/Acceptez les Conditions Générales d’Utilisation/)
      ).toBeInTheDocument()
      expect(modifierDateSignatureCGU).not.toHaveBeenCalled()
    })

    describe('Quand le formulaire est complété', () => {
      const now = DateTime.now()
      beforeEach(async () => {
        // Given
        jest.spyOn(DateTime, 'now').mockReturnValue(now)
        await userEvent.click(
          screen.getByRole('checkbox', {
            name: /accepter les conditions générales d’utilisation/,
          })
        )
        await userEvent.click(screen.getByRole('button', { name: /Valider/ }))
      })

      it('Appelle la méthode modifierDateSignatureCGU', () => {
        expect(modifierDateSignatureCGU).toHaveBeenCalledWith(
          conseiller.id,
          'accessToken',
          now
        )
      })

      it('Redirige vers la page souhaitée', async () => {
        // Then
        expect(routerPush).toHaveBeenCalledWith('/mes-jeunes')
      })
    })
  })

  describe('server side', () => {
    it('prépare la page', async () => {
      // Given
      const conseiller = unConseiller()

      ;(getConseillerServerSide as jest.Mock).mockReturnValue(conseiller)
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: { accessToken: 'accessToken' },
      })

      // When
      const actual = await getServerSideProps({
        req: { headers: {} },
        query: {
          redirectUrl: 'redirectUrl',
        },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({
        props: {
          accessToken: 'accessToken',
          conseiller: conseiller,
          returnTo: '/mes-jeunes',
          pageTitle: 'Consentement CGU',
          pageHeader: 'Conditions générales d’utilisation',
        },
      })
    })
  })
})
