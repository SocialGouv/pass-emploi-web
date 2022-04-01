import { mockedJeunesService } from 'fixtures/services'
import { UserStructure } from 'interfaces/conseiller'
import { GetServerSidePropsContext } from 'next/types'
import { getServerSideProps } from 'pages/mes-jeunes/milo/[numero_dossier]'
import { JeunesService } from 'services/jeunes.service'
import withDependance from 'utils/injectionDependances/withDependance'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'

jest.mock('utils/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Fiche Jeune MiLo', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })

  describe('server side', () => {
    describe("Quand l'utilisateur n'est pas connecté", () => {
      it('requiert la connexion', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          hasSession: false,
          redirect: { destination: 'whatever' },
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
        expect(actual).toEqual({ redirect: { destination: 'whatever' } })
      })
    })

    describe("Quand l'utilisateur est connecté", () => {
      describe('Pour un conseiller pas MiLo', () => {
        it('redirige vers la liste des jeunes', async () => {
          // Given
          ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
            hasSession: true,
            session: { user: { structure: UserStructure.POLE_EMPLOI } },
          })

          // When
          const actual = await getServerSideProps(
            {} as GetServerSidePropsContext
          )

          // Then
          expect(actual).toEqual({
            redirect: { destination: '/mes-jeunes', permanent: true },
          })
        })
      })

      describe('Pour un conseiller MiLo', () => {
        let jeunesService: JeunesService
        beforeEach(() => {
          // Given
          ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
            hasSession: true,
            session: { user: { structure: UserStructure.MILO } },
          })
          jeunesService = mockedJeunesService()
          ;(withDependance as jest.Mock).mockReturnValue(jeunesService)
        })

        describe('Quand le jeune existe', () => {
          it('redirige vers la fiche du jeune', async () => {
            // Given
            ;(jeunesService.getIdJeuneMilo as jest.Mock).mockResolvedValue(
              'id-jeune'
            )

            // When
            const actual = await getServerSideProps({
              query: { numeroDossier: 'numero-dossier' },
            } as unknown as GetServerSidePropsContext)

            // Then
            expect(actual).toEqual({
              redirect: {
                destination: '/mes-jeunes/id-jeune',
                permanent: true,
              },
            })
          })
        })

        describe("Quand le jeune n'existe pas", () => {
          it('redirige vers la liste des jeunes', async () => {
            // Given
            ;(jeunesService.getIdJeuneMilo as jest.Mock).mockResolvedValue(
              undefined
            )

            // When
            const actual = await getServerSideProps({
              query: { numeroDossier: 'id-jeune' },
            } as unknown as GetServerSidePropsContext)

            // Then
            expect(actual).toEqual({
              redirect: { destination: '/mes-jeunes', permanent: true },
            })
          })
        })
      })
    })
  })
})
