import { DateTime } from 'luxon'
import { Account } from 'next-auth'
import { JWT } from 'next-auth/jwt'

import { StructureConseiller } from 'interfaces/conseiller'
import { handleJWTAndRefresh } from 'utils/auth/authenticator'
import { fetchJson } from 'utils/httpClient'

jest.mock('utils/httpClient')

describe('Authenticator', () => {
  let accessToken: string
  let refreshToken: string
  let now: DateTime

  beforeEach(() => {
    // httpClient = { fetchJson: jest.fn(), fetchNoContent: jest.fn() }
    now = DateTime.now()
    jest.spyOn(DateTime, 'now').mockReturnValue(now)

    accessToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJleGItdTZsMmNkS1BzWEdRUXJIb0tIS0lVS2NmbE9xUkcyYTE0QjNWSzRVIn0.eyJleHAiOjE2NDYwMzkwMjgsImlhdCI6MTY0NjAzNzIyOCwiYXV0aF90aW1lIjoxNjQ2MDM3MjI4LCJqdGkiOiI4MmQwOWI2Zi00NjFmLTQ2OWEtODk0Yy01NDYzMmE2NmU5YzUiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODIvYXV0aC9yZWFsbXMvcGFzcy1lbXBsb2kiLCJzdWIiOiI4NDNkYzljZS1jMWVlLTRmYjUtODYwMy1hYjI3MzEwMzY0N2QiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJwYXNzLWVtcGxvaS13ZWIiLCJzZXNzaW9uX3N0YXRlIjoiYTIyZjY3OWYtZmFjZi00ZTgzLWEwZjgtYjI0YzBkMzJjNGZiIiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJjb25zZWlsbGVyX3N1cGVydmlzZXVyIl19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwYXNzLWVtcGxvaS11c2VyIHByb2ZpbGUiLCJzaWQiOiJhMjJmNjc5Zi1mYWNmLTRlODMtYTBmOC1iMjRjMGQzMmM0ZmIiLCJ1c2VyUm9sZXMiOlsiU1VQRVJWSVNFVVIiXSwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJ1c2VyU3RydWN0dXJlIjoiUEFTU19FTVBMT0kiLCJuYW1lIjoiTmlscyBUYXZlcm5pZXIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiI0MSIsInVzZXJUeXBlIjoiQ09OU0VJTExFUiIsImdpdmVuX25hbWUiOiJOaWxzIiwidXNlcklkIjoiNDEiLCJmYW1pbHlfbmFtZSI6IlRhdmVybmllciIsImVtYWlsIjoibmlscy50YXZlcm5pZXJAcGFzc2VtcGxvaS5jb20ifQ.TdAdafg4EVyJkTaBfEiFLjsGjWyAkFgIcBfB72tmYc6uVWvy49u5RJIkqVk60OEjsGX6bfSW_lbAp8nR1tpfVMV_rAHCFnnk3nw2dh-Qp2jmNfvlxY5v1m_KouK-7_XB6xJ-M7-Q2EUQmRn5XFJ31Pka7JaSCaCHae7W-juE4Ocko2eEbYV24OtRqRYXLlAS3WPR9vVufVwRp-hQYghdQ9WvAsdPzGW9yqnl5FlA7ITx_ad8OwCIQtFznXqzXYVq9bqfBqnsxz6lb9KHhL5EGIjqaWxzxLeIZ44Ag3R1hUhDOZYaw2qD1VMu2HnhDqESCiCoYTYRKasKCsyaSFKZ-A'
    refreshToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI1N2Q0M2NmNy02YjRiLTRlZTItODNkYi0xOTRjYWUwYjZkMGUifQ.eyJleHAiOjE2Mzg0MzYyMzcsImlhdCI6MTYzODQzNDQzNywianRpIjoiYzRmODI0ZjUtNDhlNS00ZDkwLTkwNWQtNmYxZDhlOGJmYTkxIiwiaXNzIjoiaHR0cHM6Ly9wYS1hdXRoLXN0YWdpbmcub3NjLXNlY251bS1mcjEuc2NhbGluZ28uaW8vYXV0aC9yZWFsbXMvcGFzcy1lbXBsb2kiLCJhdWQiOiJodHRwczovL3BhLWF1dGgtc3RhZ2luZy5vc2Mtc2VjbnVtLWZyMS5zY2FsaW5nby5pby9hdXRoL3JlYWxtcy9wYXNzLWVtcGxvaSIsInN1YiI6IjQ0ODA5MmRhLTRhZDctNGZjZi04ZmY1LWEzMDNmMzBlYTEwOSIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJwYXNzLWVtcGxvaS13ZWIiLCJzZXNzaW9uX3N0YXRlIjoiYTBiNDliM2QtNjU3Ny00MWNkLWI5NzAtNTQwNDk5NWI4MmEzIiwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6ImEwYjQ5YjNkLTY1NzctNDFjZC1iOTcwLTU0MDQ5OTViODJhMyJ9.u9FW5_DfCAbWHff8K3ZazNOea7uoe_Bb2onJ_cVpmFs'
  })

  describe('handleJWTAndRefresh', () => {
    const cinqMnEnS = 300

    describe("Quand c'est la 1ere connexion", () => {
      it('enrichit le JWT avec les infos du token et du conseiller', async () => {
        // Given
        const expiresAtInSeconds: number = 1638434737

        // When
        const jwt = jwtFixture()
        const actual = await handleJWTAndRefresh({
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
          estConseiller: true,
          structureConseiller: StructureConseiller.PASS_EMPLOI,
        })
      })
    })
    describe("Quand ce n'est pas la première connexion", () => {
      it('renvoie le JWT', async () => {
        // When
        const jwt = {
          ...jwtFixture(),
          expiresAtTimestamp: now.plus({ second: 20 }).toMillis(),
        }
        const actual = await handleJWTAndRefresh({
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
            expiresAtTimestamp: now.minus({ minute: 5 }).toMillis(),
          }
          const nouvelAccessToken = 'nouvelAccessToken'
          const nouveauRefreshToken = 'nouveauRefreshToken'
          ;(fetchJson as jest.Mock).mockResolvedValueOnce({
            content: {
              access_token: nouvelAccessToken,
              refresh_token: nouveauRefreshToken,
              expires_in: cinqMnEnS,
            },
          })

          // When
          const actual = await handleJWTAndRefresh({
            jwt,
          })

          // Then
          const jwtMisAjour = {
            ...jwt,
            accessToken: nouvelAccessToken,
            refreshToken: nouveauRefreshToken,
            expiresAtTimestamp: now.plus({ minute: 5 }).toMillis(),
          }
          expect(actual).toEqual(jwtMisAjour)
        })
      })

      describe("si l'access token expire dans moins de 15 secondes", () => {
        it('utilise le refresh token pour récupérer un nouvel access token', async () => {
          // Given
          const jwt = {
            ...jwtFixture(),
            accessToken: 'accessToken',
            refreshToken: 'refreshToken',
            expiresAtTimestamp: now.plus({ second: 13 }).toMillis(),
          }

          const nouvelAccessToken = 'nouvelAccessToken'
          const nouveauRefreshToken = 'nouveauRefreshToken'
          ;(fetchJson as jest.Mock).mockResolvedValueOnce({
            content: {
              access_token: nouvelAccessToken,
              refresh_token: nouveauRefreshToken,
              expires_in: cinqMnEnS,
            },
          })

          // When
          const actual = await handleJWTAndRefresh({
            jwt,
          })

          // Then
          const jwtMisAjour = {
            ...jwt,
            accessToken: nouvelAccessToken,
            refreshToken: nouveauRefreshToken,
            expiresAtTimestamp: now.plus({ minute: 5 }).toMillis(),
          }
          expect(actual).toEqual(jwtMisAjour)
        })
      })
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
