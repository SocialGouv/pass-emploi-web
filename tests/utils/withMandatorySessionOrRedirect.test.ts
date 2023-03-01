import { GetServerSidePropsContext } from 'next/types'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'

import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('next-auth/react', () => ({ getSession: jest.fn() }))

describe('withMandatorySessionOrRedirect', () => {
  let session: Session
  beforeEach(() => {
    session = { user: { estConseiller: true } } as Session
  })

  describe("Quand l'utilisateur n'est pas connecté", () => {
    beforeEach(() => {
      // Given
      ;(getSession as jest.Mock).mockResolvedValue(null)
    })

    it('prépare une redirection vers la connexion', async () => {
      // When
      const actual = await withMandatorySessionOrRedirect({
        req: {},
        resolvedUrl: '/',
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({
        redirect: { destination: '/login', permanent: false },
        validSession: false,
      })
    })

    it("prépare une redirection vers la connexion en conservant l'url de provenance", async () => {
      // When
      const actual = await withMandatorySessionOrRedirect({
        req: {},
        resolvedUrl: '/mes-jeunes/id-jeune',
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({
        redirect: {
          destination: '/login?redirectUrl=%2Fmes-jeunes%2Fid-jeune',
          permanent: false,
        },
        validSession: false,
      })
    })
  })

  describe("Quand l'utilisateur n'est pas un conseiller", () => {
    it('empêche la connexion', async () => {
      session.user.estConseiller = false
      ;(getSession as jest.Mock).mockResolvedValue(session)

      // When
      const actual = await withMandatorySessionOrRedirect({
        req: {},
        resolvedUrl: '/',
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({
        redirect: {
          destination: '/api/auth/federated-logout',
          permanent: false,
        },
        validSession: false,
      })
    })
  })

  describe('Quand le token est expiré', () => {
    it('force la déconnexion', async () => {
      session.error = 'RefreshAccessTokenError'
      ;(getSession as jest.Mock).mockResolvedValue(session)

      // When
      const actual = await withMandatorySessionOrRedirect({
        req: {},
        resolvedUrl: '/',
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({
        redirect: {
          destination: '/api/auth/federated-logout',
          permanent: false,
        },
        validSession: false,
      })
    })
  })

  describe('Quand tout va bien', () => {
    it('renvoie la session', async () => {
      // Given
      ;(getSession as jest.Mock).mockResolvedValue(session)

      // When
      const actual = await withMandatorySessionOrRedirect({
        req: {},
        resolvedUrl: '/',
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({ session, validSession: true })
    })
  })
})
