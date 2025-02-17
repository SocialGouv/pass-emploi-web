import { DateTime } from 'luxon'
import { Account } from 'next-auth'
import { JWT } from 'next-auth/jwt'

import { structureMilo } from 'interfaces/structure'
import { handleJWTAndRefresh } from 'utils/auth/authenticator'
import { fetchJson } from 'utils/httpClient'

jest.mock('utils/httpClient')

describe('Authenticator', () => {
  let now: DateTime

  describe('conseiller Milo', () => {
    let accessToken: string
    let refreshToken: string
    beforeEach(() => {
      now = DateTime.now()
      jest.spyOn(DateTime, 'now').mockReturnValue(now)

      accessToken =
        'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJnMG4zdi1lV2pLZVdjSXdSTlljQ2dSaHJTVkdBSXdpLWYxRnlOOVk1R1ZZIn0.eyJleHAiOjE2ODg1NTk5NTIsImlhdCI6MTY4ODU1ODE1MiwiYXV0aF90aW1lIjoxNjg4NTU4MTUyLCJqdGkiOiI1ZTU3YmIxMC00NGE0LTRmZTItYTRkMi1hNzA2ZGNkNmVmY2QiLCJpc3MiOiJodHRwczovL2lkLnBhc3MtZW1wbG9pLmluY3ViYXRldXIubmV0L2F1dGgvcmVhbG1zL3Bhc3MtZW1wbG9pIiwiYXVkIjpbImJyb2tlciIsImFjY291bnQiXSwic3ViIjoiZjlhYTBiOGYtNWYwYi00NWEwLThlM2EtYWQzYTU3ZmJiZTdkIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoicGFzcy1lbXBsb2ktd2ViIiwic2Vzc2lvbl9zdGF0ZSI6ImJhZjQ1MWIxLWI1YTAtNGYyZS1iNjIzLWM0ZjlmM2JlYjI4ZSIsImFjciI6IjEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1wYXNzLWVtcGxvaSIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJicm9rZXIiOnsicm9sZXMiOlsicmVhZC10b2tlbiJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgcGFzcy1lbXBsb2ktdXNlciBlbWFpbCBwcm9maWxlIiwic2lkIjoiYmFmNDUxYjEtYjVhMC00ZjJlLWI2MjMtYzRmOWYzYmViMjhlIiwidXNlclJvbGVzIjpbIlNVUEVSVklTRVVSIl0sImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwidXNlclN0cnVjdHVyZSI6Ik1JTE8iLCJuYW1lIjoiQWxiZXJ0IER1cmFudCIsInVzZXJUeXBlIjoiQ09OU0VJTExFUiIsInByZWZlcnJlZF91c2VybmFtZSI6InRlY2huaWNhbC5hLmR1cmFudCIsImdpdmVuX25hbWUiOiJBbGJlcnQiLCJmYW1pbHlfbmFtZSI6IkR1cmFudCIsInVzZXJJZCI6Ijk3MmQwMTNkLTM3ODEtNDE4YS05YjhkLTFlMjg4ZjM0NmI0NSIsImVtYWlsIjoiY29uc2VpbGxlci50ZWNobmlxdWUubWlsby5wYXNzZW1wbG9pQGdtYWlsLmNvbSJ9.VGmGSs8w0cnE4e_isPCfG2E5EVFsPtkgxkGO0_fr34s_Td7K5z_vGwNQB0JN3jGlE_kxDiVifkq1IF2Nd_e-GxixQWAebG6pcizo7aRl01IHxq9wGOP6uRnz_XBorMqXB06l0mff6-Zh8M7Swz2UwbOzH_5rl07vgtiQz7chDL4cYfIcBQrkHkPEN2dM7K651Z8MNMrWPRRcvwuCtHNA1qGK9VKsw-Pql8uabuNfMfrbbABh_erKGygp7VJtwcxtB7iGebq9IYIrHwOmKxGoytzAjjJob2CeYxqZs2_aWjF4NIBFlvHXR1vwEo4ljmWr8LtKQG7JzFKu1mLaj1Hx2g'
      refreshToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI1N2Q0M2NmNy02YjRiLTRlZTItODNkYi0xOTRjYWUwYjZkMGUifQ.eyJleHAiOjE2Mzg0MzYyMzcsImlhdCI6MTYzODQzNDQzNywianRpIjoiYzRmODI0ZjUtNDhlNS00ZDkwLTkwNWQtNmYxZDhlOGJmYTkxIiwiaXNzIjoiaHR0cHM6Ly9wYS1hdXRoLXN0YWdpbmcub3NjLXNlY251bS1mcjEuc2NhbGluZ28uaW8vYXV0aC9yZWFsbXMvcGFzcy1lbXBsb2kiLCJhdWQiOiJodHRwczovL3BhLWF1dGgtc3RhZ2luZy5vc2Mtc2VjbnVtLWZyMS5zY2FsaW5nby5pby9hdXRoL3JlYWxtcy9wYXNzLWVtcGxvaSIsInN1YiI6IjQ0ODA5MmRhLTRhZDctNGZjZi04ZmY1LWEzMDNmMzBlYTEwOSIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJwYXNzLWVtcGxvaS13ZWIiLCJzZXNzaW9uX3N0YXRlIjoiYTBiNDliM2QtNjU3Ny00MWNkLWI5NzAtNTQwNDk5NWI4MmEzIiwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6ImEwYjQ5YjNkLTY1NzctNDFjZC1iOTcwLTU0MDQ5OTViODJhMyJ9.u9FW5_DfCAbWHff8K3ZazNOea7uoe_Bb2onJ_cVpmFs'
    })

    const cinqMnEnS = 300

    describe("Quand c'est la 1ere connexion", () => {
      it('enrichit le JWT avec les infos du token et du conseiller et le durée de validité propre à Milo', async () => {
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
          expiresAtTimestamp: 1638434737000,
          idConseiller: '972d013d-3781-418a-9b8d-1e288f346b45',
          estSuperviseur: true,
          estSuperviseurResponsable: false,
          estConseiller: true,
          structureConseiller: structureMilo,
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
            expiresAtTimestamp: now.minus({ second: cinqMnEnS }).toMillis(),
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
            jwt: {
              ...jwt,
              structureConseiller: structureMilo,
            },
          })

          // Then
          const jwtMisAjour = {
            ...jwt,
            structureConseiller: structureMilo,
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
            structureConseiller: structureMilo,
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
            structureConseiller: structureMilo,
            expiresAtTimestamp: now.plus({ minute: 5 }).toMillis(),
          }
          expect(actual).toEqual(jwtMisAjour)
        })
      })
    })
  })

  describe('conseiller autre', () => {
    let accessToken: string
    let refreshToken: string
    beforeEach(() => {
      now = DateTime.now()
      jest.spyOn(DateTime, 'now').mockReturnValue(now)

      accessToken =
        'eyJhbGciOiJSUzI1NiIsInR5cCI6ImF0K2p3dCIsImtpZCI6Ijh4TFNNUERWWExmZGNmdXdSMkdhaWItbTY3S1hoMHQ3c1h1VGUxNnpaLTAifQ.eyJ1c2VySWQiOiIyZDI5ZDFlMS01MmE1LTRkMmUtYWE0MC1hMjQzNWM1ZTgyNGEiLCJ1c2VyUm9sZXMiOlsiU1VQRVJWSVNFVVIiLCJTVVBFUlZJU0VVUl9SRVNQT05TQUJMRSJdLCJ1c2VyU3RydWN0dXJlIjoiUE9MRV9FTVBMT0lfQUlKIiwidXNlclR5cGUiOiJDT05TRUlMTEVSIiwiZW1haWwiOiJ0bmFuMDEwMEBwb2xlLWVtcGxvaS5mciIsImZhbWlseV9uYW1lIjoiVE5BTjAxMDAiLCJnaXZlbl9uYW1lIjoiUmVjZXR0ZSIsImF6cCI6InBhc3MtZW1wbG9pLXN3YWdnZXIiLCJqdGkiOiJfVFdkMU9jRTRFR0tXR2w4bnVLZTUiLCJzdWIiOiJDT05TRUlMTEVSfFBPTEVfRU1QTE9JX0FJSnxUTkFOMDEwMCIsImlhdCI6MTcxOTMwNjU2MiwiZXhwIjoxNzE5NzM4NTYyLCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwiY2xpZW50X2lkIjoicGFzcy1lbXBsb2ktc3dhZ2dlciIsImlzcyI6Imh0dHBzOi8vaWQucGFzcy1lbXBsb2kuaW5jdWJhdGV1ci5uZXQvYXV0aC9yZWFsbXMvcGFzcy1lbXBsb2kiLCJhdWQiOiJodHRwczovL2FwaS5wYXNzLWVtcGxvaS5pbmN1YmF0ZXVyLm5ldCJ9.G009wIukvwBX5s7h7GHXw8r_V2WIG2y__lNB4vfDX1J8JVcVDItn9yep5NKaa7XX_iC8tPAscq8C0dg4BbDjtQUR72irfo7mDUQgZ2kXJxbdFPtHf6_wLq67Jzw45hta8GGjBD5CKDSf72jxGlQ6cHr3cFGG9hB_PDETTmzHmPhckLyjpderhXff0SQzQ5YvMvG_fY6PGMC0mOfnEIn6I8ZbIbeNfSqTiwtsJ2SfOIZ3SeWSgOjDvftfYNBZSMx8wRYiat8HuYDc41w6Z0ZyyGoeHzCM5XviJmSzF2u8SV7eQa55UCy0QSg8rxUwEiqHQCuQ7vuRm8lgIV6xOZJbGQ'
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
            idConseiller: '2d29d1e1-52a5-4d2e-aa40-a2435c5e824a',
            estSuperviseur: true,
            estSuperviseurResponsable: true,
            estConseiller: true,
            structureConseiller: 'POLE_EMPLOI_AIJ',
          })
        })

        it('enrichit le JWT avec les infos du token et du conseiller et le durée de validité propre à Milo', async () => {
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
            idConseiller: '2d29d1e1-52a5-4d2e-aa40-a2435c5e824a',
            estSuperviseur: true,
            estSuperviseurResponsable: true,
            estConseiller: true,
            structureConseiller: 'POLE_EMPLOI_AIJ',
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
              expiresAtTimestamp: now.minus({ second: cinqMnEnS }).toMillis(),
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
              expiresAtTimestamp: now.plus({ second: cinqMnEnS }).toMillis(),
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
              expiresAtTimestamp: now.plus({ second: cinqMnEnS }).toMillis(),
            }
            expect(actual).toEqual(jwtMisAjour)
          })
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
