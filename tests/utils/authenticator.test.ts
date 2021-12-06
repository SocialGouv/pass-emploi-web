import { Account } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import Authenticator from 'utils/auth/authenticator'

describe('Authenticator', () => {
  describe('handleJWTAndRefresh', () => {
    describe("Quand c'est la 1ere connexion", () => {
      it("enrichit le jwt avec l'accessToken, sa date d'expiration et le refreshToken", async () => {
        // Given
        const jwt: JWT = {
          name: 'toto tata',
          sub: '448092da-4ad7-4fcf-8ff5-a303f30ea109',
          iat: 1638434437,
          exp: 1641026437,
          jti: 'efe3dae2-c2a1-4ac7-a0a2-1fe6cd0c8723',
        }
        const accessToken =
          'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJnMG4zdi1lV2pLZVdjSXdSTlljQ2dSaHJTVkdBSXdpLWYxRnlOOVk1R1ZZIn0.eyJleHAiOjE2Mzg0MzQ3MzcsImlhdCI6MTYzODQzNDQzNywiYXV0aF90aW1lIjoxNjM4NDM0NDM3LCJqdGkiOiJhMDczOTExYS0yMTQ2LTQ5YTItYWE3My1hOGMwNGIwZWZiNWIiLCJpc3MiOiJodHRwczovL3BhLWF1dGgtc3RhZ2luZy5vc2Mtc2VjbnVtLWZyMS5zY2FsaW5nby5pby9hdXRoL3JlYWxtcy9wYXNzLWVtcGxvaSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI0NDgwOTJkYS00YWQ3LTRmY2YtOGZmNS1hMzAzZjMwZWExMDkiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJwYXNzLWVtcGxvaS13ZWIiLCJzZXNzaW9uX3N0YXRlIjoiYTBiNDliM2QtNjU3Ny00MWNkLWI5NzAtNTQwNDk5NWI4MmEzIiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLXBhc3MtZW1wbG9pIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJzaWQiOiJhMGI0OWIzZC02NTc3LTQxY2QtYjk3MC01NDA0OTk1YjgyYTMiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJ0b3RvIHRhdGEiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ0b3RvIiwiZ2l2ZW5fbmFtZSI6InRvdG8iLCJmYW1pbHlfbmFtZSI6InRhdGEifQ.fblndnouo81K6Qmi7qCd0xDGnrcSebHswChwX5_CJWsEGCg026tw6XoWK8woeDCQvO4DKAPZkWSSTino0egQUokPlOcAL_Z6zmSFSQswA2Yrbj93jEMXfkdZ7IZP2rymKPKIW2oRRdFVOrvrG_Y0rjGHKwtw8xKEEqNy9GDtehEiwcuecqNiiLG5I2ECEM74Np_z8WyPmQViE9YeFpRpLZhXzXtulEl8viuorYekE2jj5hzMkqeNGOt0j_hiomT9MEQ_ykbz0fp3wKLNeYJvxTN6O9SXiLgA2Z8py74xv-1BSC6f-1I0bJbQ1a9lHVAQgZ7C07m9avdFJwHDRhdxCQ'
        const refreshToken: string =
          'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI1N2Q0M2NmNy02YjRiLTRlZTItODNkYi0xOTRjYWUwYjZkMGUifQ.eyJleHAiOjE2Mzg0MzYyMzcsImlhdCI6MTYzODQzNDQzNywianRpIjoiYzRmODI0ZjUtNDhlNS00ZDkwLTkwNWQtNmYxZDhlOGJmYTkxIiwiaXNzIjoiaHR0cHM6Ly9wYS1hdXRoLXN0YWdpbmcub3NjLXNlY251bS1mcjEuc2NhbGluZ28uaW8vYXV0aC9yZWFsbXMvcGFzcy1lbXBsb2kiLCJhdWQiOiJodHRwczovL3BhLWF1dGgtc3RhZ2luZy5vc2Mtc2VjbnVtLWZyMS5zY2FsaW5nby5pby9hdXRoL3JlYWxtcy9wYXNzLWVtcGxvaSIsInN1YiI6IjQ0ODA5MmRhLTRhZDctNGZjZi04ZmY1LWEzMDNmMzBlYTEwOSIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJwYXNzLWVtcGxvaS13ZWIiLCJzZXNzaW9uX3N0YXRlIjoiYTBiNDliM2QtNjU3Ny00MWNkLWI5NzAtNTQwNDk5NWI4MmEzIiwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6ImEwYjQ5YjNkLTY1NzctNDFjZC1iOTcwLTU0MDQ5OTViODJhMyJ9.u9FW5_DfCAbWHff8K3ZazNOea7uoe_Bb2onJ_cVpmFs'
        const expiresAtInSeconds: number = 1638434737
        const account: Account = {
          userId: '',
          provider: 'keycloak',
          type: 'oauth',
          providerAccountId: '448092da-4ad7-4fcf-8ff5-a303f30ea109',
          access_token: accessToken,
          expires_at: expiresAtInSeconds,
          refresh_expires_in: 1800,
          refresh_token: refreshToken,
          token_type: 'Bearer',
          id_token:
            'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJnMG4zdi1lV2pLZVdjSXdSTlljQ2dSaHJTVkdBSXdpLWYxRnlOOVk1R1ZZIn0.eyJleHAiOjE2Mzg0MzQ3MzcsImlhdCI6MTYzODQzNDQzNywiYXV0aF90aW1lIjoxNjM4NDM0NDM3LCJqdGkiOiJmN2U0YThiYi01NWE1LTQ1NTgtOGRhZS00NWVlNmNmNDBkMDciLCJpc3MiOiJodHRwczovL3BhLWF1dGgtc3RhZ2luZy5vc2Mtc2VjbnVtLWZyMS5zY2FsaW5nby5pby9hdXRoL3JlYWxtcy9wYXNzLWVtcGxvaSIsImF1ZCI6InBhc3MtZW1wbG9pLXdlYiIsInN1YiI6IjQ0ODA5MmRhLTRhZDctNGZjZi04ZmY1LWEzMDNmMzBlYTEwOSIsInR5cCI6IklEIiwiYXpwIjoicGFzcy1lbXBsb2ktd2ViIiwic2Vzc2lvbl9zdGF0ZSI6ImEwYjQ5YjNkLTY1NzctNDFjZC1iOTcwLTU0MDQ5OTViODJhMyIsImF0X2hhc2giOiJ6d0ZJeDZuRnV6S0ZFN2VJMnJKaGpnIiwiYWNyIjoiMSIsInNpZCI6ImEwYjQ5YjNkLTY1NzctNDFjZC1iOTcwLTU0MDQ5OTViODJhMyIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6InRvdG8gdGF0YSIsInByZWZlcnJlZF91c2VybmFtZSI6InRvdG8iLCJnaXZlbl9uYW1lIjoidG90byIsImZhbWlseV9uYW1lIjoidGF0YSJ9.cZV2UtzE5_INhT_Rn4eXX9hLSU1ExbREfODcS45oqngWLMdPJJWW02vKfsvi6GHxbWwsYwWXl3BMEKkp2ewySMG_2Zj4EMpQq2kB2d5qKfJOCrSneFKNJZ7g6iqyfQUq0tXz9op9IhhGwxGF2i3Y3ac9ecHLPKVduvz_ogZWJoWLPTt-41WGAcxUEZbRYv19yTB5Uny0Ym1oCybJhcX1-F9Imwzb-nGjuGjRQHoTBs6mTBEjvWZJPYbEPj4Cp2XYOZi1r5w7aOhW7bH8ymLeJok4JeXCZNWhBOLZGVKuNwb2_ZqCCF2rBkUu0JhrNazdKlWXjrY578s1eX8vBVo7WQ',
          'not-before-policy': 1638370558,
          session_state: 'a0b49b3d-6577-41cd-b970-5404995b82a3',
          scope: 'openid email profile',
        }

        // When
        const actual = Authenticator.handleJWTAndRefresh({
          jwt,
          account,
        })

        // Then
        expect(actual).toEqual({
          ...jwt,
          accessToken,
          refreshToken,
          expiresAt: new Date(expiresAtInSeconds * 1000),
        })
      })
    })
  })
})
