import { Account } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import { AuthService } from 'services/auth.service'
import { Authenticator } from 'utils/auth/authenticator'
import { UserStructure } from 'interfaces/conseiller'

const now = 163887007214

describe('Authenticator', () => {
  let authenticator: Authenticator
  let authService: AuthService
  let accessToken: string
  let refreshToken: string

  beforeEach(() => {
    authService = {
      fetchRefreshedTokens: jest.fn(),
      getFirebaseToken: jest.fn(),
    }

    authenticator = new Authenticator(authService)

    jest.spyOn(Date, 'now').mockReturnValue(now)
    accessToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJnMG4zdi1lV2pLZVdjSXdSTlljQ2dSaHJTVkdBSXdpLWYxRnlOOVk1R1ZZIn0.eyJleHAiOjE2Mzk0OTE3NzQsImlhdCI6MTYzOTQ5MTQ3NCwiYXV0aF90aW1lIjoxNjM5NDkwODUxLCJqdGkiOiI4ZTRkYjcyMi1iOWVjLTQ1NGQtODA3Yi1kMDdkMzNiOGUxODgiLCJpc3MiOiJodHRwczovL3BhLWF1dGgtc3RhZ2luZy5vc2Mtc2VjbnVtLWZyMS5zY2FsaW5nby5pby9hdXRoL3JlYWxtcy9wYXNzLWVtcGxvaSIsInN1YiI6IjQ2YmYxYTBhLWVjYzItNGI1OS05Y2UzLWNjYTBlZmEzYjdmNSIsInR5cCI6IkJlYXJlciIsImF6cCI6InBhc3MtZW1wbG9pLXdlYiIsInNlc3Npb25fc3RhdGUiOiJhODAxYTg1Ny1mMTk1LTQ4NmEtOTk4ZC1kNzA4ZTcyZDUzY2UiLCJhY3IiOiIxIiwic2NvcGUiOiJvcGVuaWQgcGFzcy1lbXBsb2ktdXNlciBlbWFpbCBwcm9maWxlIiwic2lkIjoiYTgwMWE4NTctZjE5NS00ODZhLTk5OGQtZDcwOGU3MmQ1M2NlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJ1c2VyU3RydWN0dXJlIjoiTUlMTyIsIm5hbWUiOiJBbGJlcnQgRHVyYW50IiwidXNlclR5cGUiOiJDT05TRUlMTEVSIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYS5kdXJhbnQiLCJnaXZlbl9uYW1lIjoiQWxiZXJ0IiwiZmFtaWx5X25hbWUiOiJEdXJhbnQiLCJ1c2VySWQiOiJiY2Q2MDQwMy01ZjEwLTRhMTYtYTY2MC0yMDk5ZDc5ZWJkNjYiLCJlbWFpbCI6ImNvbnNlaWxsZXIubWlsby5wYXNzZW1wbG9pQGdtYWlsLmNvbSJ9.HKXwXzwHx2ldiOkhjQVBeiGA1vhuDellqHQLz54dGKzj45mCMPIIms5rbyL9q08zGxJr2dDpN5qFGzTUkf4CPku_yV5p2K30MZPaPeTUvZSrLzYbcsklnorMbbN99Q9NEeUF4Q-33lX5VNd56lyYCusxbz5nIVHb8KoiSnh_ikqjEWZfrFIphpUdXCUyOpi2Oh9D9v4930IKjL8b9TvgsLUtdRRIaWXtq08F_wsXQ_d9r-afWtoLWfMiQTnHGMu4OetizlMcRZBtAR255qqP3Ckoiw19Znb_BhnevIwtS9iHXQBcR0hu8F3wNtB4JLIP1n9qoZ_auPe4UdB8Lun0Xg'
    refreshToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI1N2Q0M2NmNy02YjRiLTRlZTItODNkYi0xOTRjYWUwYjZkMGUifQ.eyJleHAiOjE2Mzg0MzYyMzcsImlhdCI6MTYzODQzNDQzNywianRpIjoiYzRmODI0ZjUtNDhlNS00ZDkwLTkwNWQtNmYxZDhlOGJmYTkxIiwiaXNzIjoiaHR0cHM6Ly9wYS1hdXRoLXN0YWdpbmcub3NjLXNlY251bS1mcjEuc2NhbGluZ28uaW8vYXV0aC9yZWFsbXMvcGFzcy1lbXBsb2kiLCJhdWQiOiJodHRwczovL3BhLWF1dGgtc3RhZ2luZy5vc2Mtc2VjbnVtLWZyMS5zY2FsaW5nby5pby9hdXRoL3JlYWxtcy9wYXNzLWVtcGxvaSIsInN1YiI6IjQ0ODA5MmRhLTRhZDctNGZjZi04ZmY1LWEzMDNmMzBlYTEwOSIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJwYXNzLWVtcGxvaS13ZWIiLCJzZXNzaW9uX3N0YXRlIjoiYTBiNDliM2QtNjU3Ny00MWNkLWI5NzAtNTQwNDk5NWI4MmEzIiwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6ImEwYjQ5YjNkLTY1NzctNDFjZC1iOTcwLTU0MDQ5OTViODJhMyJ9.u9FW5_DfCAbWHff8K3ZazNOea7uoe_Bb2onJ_cVpmFs'
  })

  describe('handleJWTAndRefresh', () => {
    const cinqMnEnS = 300
    const cinqMnEnMs = 300000

    describe("Quand c'est la 1ere connexion", () => {
      it("enrichit le JWT avec l'accessToken, sa date d'expiration et le refreshToken", async () => {
        // Given
        accessToken
        refreshToken
        const expiresAtInSeconds: number = 1638434737

        // When
        const jwt = jwtFixture()
        const actual = await authenticator.handleJWTAndRefresh({
          jwt: jwt,
          account: accountFixture({
            accessToken,
            refreshToken,
            expiresAtInSeconds,
          }),
        })

        // Then
        expect(actual).toEqual({
          ...jwt,
          accessToken,
          refreshToken,
          expiresAtTimestamp: expiresAtInSeconds * 1000,
        })
      })
    })
    describe("Quand ce n'est pas la première connexion", () => {
      it('renvoie le JWT', () => {
        // When
        const vingtSEnMs = 20000
        const jwt = {
          ...jwtFixture(),
          expiresAtTimestamp: now + vingtSEnMs,
        }
        const actual = authenticator.handleJWTAndRefresh({
          jwt,
          account: undefined,
        })
        // Then
        expect(actual).toEqual(jwt)
      })

      describe("Quand l'accessToken est expiré", () => {
        it('utilise le refresh token pour récupérer un nouvel access token', async () => {
          // Given
          const jwt = {
            ...jwtFixture(),
            accessToken: 'accessToken',
            refreshToken: 'refreshToken',
            expiresAtTimestamp: now - cinqMnEnMs,
          }
          const nouvelAccessToken = 'nouvelAccessToken'
          const nouveauRefreshToken = 'nouveauRefreshToken'
          authService.fetchRefreshedTokens = jest.fn().mockResolvedValueOnce({
            access_token: nouvelAccessToken,
            refresh_token: nouveauRefreshToken,
            expires_in: cinqMnEnS,
          })

          // When
          const actual = await authenticator.handleJWTAndRefresh({
            jwt,
          })

          // Then
          const jwtMisAjour = {
            ...jwt,
            accessToken: nouvelAccessToken,
            refreshToken: nouveauRefreshToken,
            expiresAtTimestamp: now + cinqMnEnMs,
          }
          expect(actual).toEqual(jwtMisAjour)
        })
      })

      describe("si l'access token expire dans moins de 15 secondes", () => {
        it('utilise le refresh token pour récupérer un nouvel access token', async () => {
          const treizeSenMs = 13000
          // Given
          const jwt = {
            ...jwtFixture(),
            accessToken: 'accessToken',
            refreshToken: 'refreshToken',
            expiresAtTimestamp: now + treizeSenMs,
          }

          const nouvelAccessToken = 'nouvelAccessToken'
          const nouveauRefreshToken = 'nouveauRefreshToken'
          authService.fetchRefreshedTokens = jest.fn().mockResolvedValueOnce({
            access_token: nouvelAccessToken,
            refresh_token: nouveauRefreshToken,
            expires_in: cinqMnEnS,
          })

          // When
          const actual = await authenticator.handleJWTAndRefresh({
            jwt,
          })

          // Then
          const jwtMisAjour = {
            ...jwt,
            accessToken: nouvelAccessToken,
            refreshToken: nouveauRefreshToken,
            expiresAtTimestamp: now + cinqMnEnMs,
          }
          expect(actual).toEqual(jwtMisAjour)
        })
      })
    })
    describe('Quand un conseiller SIMILO se connecte', () => {
      it("renvoie la structure d'origine du conseiller", async () => {
        // Given
        accessToken
        refreshToken
        const expiresAtInSeconds: number = 1638434737

        // When
        const jwt = jwtFixture()
        const actual = await authenticator.handleJWTAndRefresh({
          jwt,
          account: accountFixture({
            accessToken,
            refreshToken,
            expiresAtInSeconds,
          }),
        })

        // Then
        expect(actual.structureConseiller).toEqual(UserStructure.MILO)
      })
    })
  })

  describe('handleFirebaseToken', () => {
    it('devrait retourner le token firebase', async () => {
      //GIVEN
      const expectedResult = accessToken
      authService.getFirebaseToken = jest.fn().mockResolvedValueOnce({
        token: accessToken,
      })

      //WHEN
      const result = await authenticator.getFirebaseToken(accessToken)

      //THEN
      expect(result).toEqual(expectedResult)
    })
  })
})

const accountFixture = (params: {
  accessToken: string
  expiresAtInSeconds: number
  refreshToken: string
}): Account => ({
  userId: '',
  provider: 'keycloak',
  type: 'oauth',
  providerAccountId: '448092da-4ad7-4fcf-8ff5-a303f30ea109',
  access_token: params.accessToken,
  expires_at: params.expiresAtInSeconds,
  refresh_expires_in: 1800,
  refresh_token: params.refreshToken,
  token_type: 'Bearer',
  id_token:
    'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJnMG4zdi1lV2pLZVdjSXdSTlljQ2dSaHJTVkdBSXdpLWYxRnlOOVk1R1ZZIn0.eyJleHAiOjE2Mzg0MzQ3MzcsImlhdCI6MTYzODQzNDQzNywiYXV0aF90aW1lIjoxNjM4NDM0NDM3LCJqdGkiOiJmN2U0YThiYi01NWE1LTQ1NTgtOGRhZS00NWVlNmNmNDBkMDciLCJpc3MiOiJodHRwczovL3BhLWF1dGgtc3RhZ2luZy5vc2Mtc2VjbnVtLWZyMS5zY2FsaW5nby5pby9hdXRoL3JlYWxtcy9wYXNzLWVtcGxvaSIsImF1ZCI6InBhc3MtZW1wbG9pLXdlYiIsInN1YiI6IjQ0ODA5MmRhLTRhZDctNGZjZi04ZmY1LWEzMDNmMzBlYTEwOSIsInR5cCI6IklEIiwiYXpwIjoicGFzcy1lbXBsb2ktd2ViIiwic2Vzc2lvbl9zdGF0ZSI6ImEwYjQ5YjNkLTY1NzctNDFjZC1iOTcwLTU0MDQ5OTViODJhMyIsImF0X2hhc2giOiJ6d0ZJeDZuRnV6S0ZFN2VJMnJKaGpnIiwiYWNyIjoiMSIsInNpZCI6ImEwYjQ5YjNkLTY1NzctNDFjZC1iOTcwLTU0MDQ5OTViODJhMyIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6InRvdG8gdGF0YSIsInByZWZlcnJlZF91c2VybmFtZSI6InRvdG8iLCJnaXZlbl9uYW1lIjoidG90byIsImZhbWlseV9uYW1lIjoidGF0YSJ9.cZV2UtzE5_INhT_Rn4eXX9hLSU1ExbREfODcS45oqngWLMdPJJWW02vKfsvi6GHxbWwsYwWXl3BMEKkp2ewySMG_2Zj4EMpQq2kB2d5qKfJOCrSneFKNJZ7g6iqyfQUq0tXz9op9IhhGwxGF2i3Y3ac9ecHLPKVduvz_ogZWJoWLPTt-41WGAcxUEZbRYv19yTB5Uny0Ym1oCybJhcX1-F9Imwzb-nGjuGjRQHoTBs6mTBEjvWZJPYbEPj4Cp2XYOZi1r5w7aOhW7bH8ymLeJok4JeXCZNWhBOLZGVKuNwb2_ZqCCF2rBkUu0JhrNazdKlWXjrY578s1eX8vBVo7WQ',
  'not-before-policy': 1638370558,
  session_state: 'a0b49b3d-6577-41cd-b970-5404995b82a3',
  scope: 'openid email profile',
})

const jwtFixture = (): JWT => ({
  name: 'toto tata',
  sub: '448092da-4ad7-4fcf-8ff5-a303f30ea109',
  iat: 1638434437,
  exp: 1641026437,
  jti: 'efe3dae2-c2a1-4ac7-a0a2-1fe6cd0c8723',
})
