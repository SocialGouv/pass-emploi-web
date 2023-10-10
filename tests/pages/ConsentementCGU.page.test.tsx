import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import ConsentementCgu, { getServerSideProps } from 'pages/consentement-cgu'
import {
  getConseillerClientSide,
  getConseillerServerSide,
  modifierDateSignatureCGU,
} from 'services/conseiller.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

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
    })

    describe('Adapte le wording', () => {
      it('Pour un conseiller BRSA', () => {
        // Given
        conseiller = unConseiller({
          structure: StructureConseiller.POLE_EMPLOI_BRSA,
        })
        ;(getConseillerClientSide as jest.Mock).mockResolvedValue(conseiller)

        // When
        act(() => {
          renderWithContexts(<ConsentementCgu returnTo='/mes-jeunes' />, {
            customConseiller: conseiller,
          })
        })

        // Then
        expect(
          screen.getByText(
            /La plateforme pass emploi a pour objet de contribuer à l’insertion professionnelle des Usagers du RSA./
          )
        ).toBeInTheDocument()
      })

      it('Pour un conseiller CEJ', () => {
        // Given
        conseiller = unConseiller({
          structure: StructureConseiller.MILO,
        })
        ;(getConseillerClientSide as jest.Mock).mockResolvedValue(conseiller)

        // When
        act(() => {
          renderWithContexts(
            <ConsentementCgu accessToken='accessToken' returnTo='/mes-jeunes' />
          ),
            {
              customConseiller: conseiller,
            }
        })

        // Then
        expect(
          screen.getByText(
            /La plateforme CEJ a pour objet de contribuer à la diminution du décrochage des jeunes en accompagnement vers l’emploi./
          )
        ).toBeInTheDocument()
      })
    })

    describe('Gère le formulaire', () => {
      beforeEach(async () => {
        // Given
        conseiller = unConseiller()
        act(() => {
          renderWithContexts(
            <ConsentementCgu accessToken='accessToken' returnTo='/mes-jeunes' />
          ),
            {
              customConseiller: conseiller,
            }
        })
      })
      it('Affiche un message d’erreur quand le conseiller ne donne pas son consentement', async () => {
        // When
        await userEvent.click(screen.getByRole('button', { name: /Valider/ }))

        // Then
        expect(
          screen.getByText(/Le champ Consentement est vide./)
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
          expect(modifierDateSignatureCGU).toHaveBeenCalledWith(now)
        })

        it('Redirige vers la page souhaitée', async () => {
          // Then
          expect(routerPush).toHaveBeenCalledWith('/mes-jeunes')
        })
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
          returnTo: '/mes-jeunes',
          pageTitle: 'Consentement CGU',
          pageHeader: 'Conditions générales d’utilisation',
        },
      })
    })
  })
})
