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
      'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJnMG4zdi1lV2pLZVdjSXdSTlljQ2dSaHJTVkdBSXdpLWYxRnlOOVk1R1ZZIn0.eyJleHAiOjE2NDMyMjEwMTksImlhdCI6MTY0MzIxOTIxOSwiYXV0aF90aW1lIjoxNjQzMjE5MjE5LCJqdGkiOiJkOGU3NmZhYS1jNjlmLTQ4NDItOWY0OS1kOGNiODcwY2YxYWQiLCJpc3MiOiJodHRwczovL2lkLnBhc3MtZW1wbG9pLmluY3ViYXRldXIubmV0L2F1dGgvcmVhbG1zL3Bhc3MtZW1wbG9pIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImJiOWQ0NGJiLTUyYWItNDE0Yy04OTYzLWJhZDFmYTcyZTA1YSIsInR5cCI6IkJlYXJlciIsImF6cCI6InBhc3MtZW1wbG9pLXdlYiIsInNlc3Npb25fc3RhdGUiOiJjODgyMTM4Yi0xY2Y0LTQ4NmQtYjcyMS1mODQwMzEzZmRiNzkiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtcGFzcy1lbXBsb2kiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIiwiY29uc2VpbGxlcl9zdXBlcnZpc2V1ciJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIHBhc3MtZW1wbG9pLXVzZXIgZW1haWwgcHJvZmlsZSIsInNpZCI6ImM4ODIxMzhiLTFjZjQtNDg2ZC1iNzIxLWY4NDAzMTNmZGI3OSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwidXNlclN0cnVjdHVyZSI6IlBBU1NfRU1QTE9JIiwibmFtZSI6Ik1BTEVLIE1BTEVLIiwidXNlclR5cGUiOiJDT05TRUlMTEVSIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiNDEiLCJnaXZlbl9uYW1lIjoiTUFMRUsiLCJmYW1pbHlfbmFtZSI6Ik1BTEVLIiwidXNlcklkIjoiNDEiLCJlbWFpbCI6Im1haWxAbWFpbC5jb20ifQ.ADy401VOJn-HTuQvdY1d8WOj7K6CVXjl5apEAtnPeKcDXyvdGf1NfxEvnGr6YM8XIHfkEXVqnQCvdfLGbs6x8w0Bm8GujrukzfAPkCDrni1QufB-nhTkWQJvTApzbuQa9PwaVybKIqBV5jI5aU6AM80y-BdVon3XFXyxkKTaB2SQya8jIIFM9fjuZRJnHyoNxeNQdysSgqx5WXtrTUADgGW8nkScAO6-gxPtZF723hkFifnSt88ny7-BaVUy1IU6Gx7XBE8x_MOKzo5rgEctedg3g-MOWCl4l38BR8SZn5U_owygezO8pwBryxoal5wOrHVJkWwV1ZmMyyndl9GV8w'
    refreshToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI1N2Q0M2NmNy02YjRiLTRlZTItODNkYi0xOTRjYWUwYjZkMGUifQ.eyJleHAiOjE2Mzg0MzYyMzcsImlhdCI6MTYzODQzNDQzNywianRpIjoiYzRmODI0ZjUtNDhlNS00ZDkwLTkwNWQtNmYxZDhlOGJmYTkxIiwiaXNzIjoiaHR0cHM6Ly9wYS1hdXRoLXN0YWdpbmcub3NjLXNlY251bS1mcjEuc2NhbGluZ28uaW8vYXV0aC9yZWFsbXMvcGFzcy1lbXBsb2kiLCJhdWQiOiJodHRwczovL3BhLWF1dGgtc3RhZ2luZy5vc2Mtc2VjbnVtLWZyMS5zY2FsaW5nby5pby9hdXRoL3JlYWxtcy9wYXNzLWVtcGxvaSIsInN1YiI6IjQ0ODA5MmRhLTRhZDctNGZjZi04ZmY1LWEzMDNmMzBlYTEwOSIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJwYXNzLWVtcGxvaS13ZWIiLCJzZXNzaW9uX3N0YXRlIjoiYTBiNDliM2QtNjU3Ny00MWNkLWI5NzAtNTQwNDk5NWI4MmEzIiwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6ImEwYjQ5YjNkLTY1NzctNDFjZC1iOTcwLTU0MDQ5OTViODJhMyJ9.u9FW5_DfCAbWHff8K3ZazNOea7uoe_Bb2onJ_cVpmFs'
  })

  describe('handleJWTAndRefresh', () => {
    const cinqMnEnS = 300
    const cinqMnEnMs = 300000

    describe("Quand c'est la 1ere connexion", () => {
      it("enrichit le JWT avec l'accessToken, sa date d'expiration et le refreshToken", async () => {
        // Given
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
          idConseiller: '41',
          estSuperviseur: true,
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
    describe('Quand un conseiller Pass emploi se connecte', () => {
      it("renvoie la structure d'origine du conseiller", async () => {
        // Given
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
        expect(actual.structureConseiller).toEqual(UserStructure.PASS_EMPLOI)
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
      const result = await authenticator.handleFirebaseToken(accessToken)

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
