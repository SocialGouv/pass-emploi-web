import { render, screen } from '@testing-library/react'
import { desJeunes } from 'fixtures/jeune'
import { mockedJeunesService } from 'fixtures/services'
import { GetServerSidePropsContext } from 'next/types'
import EditionRdv, { getServerSideProps } from 'pages/mes-jeunes/edition-rdv'
import withDependance from 'utils/injectionDependances/withDependance'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'

jest.mock('utils/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('EditionRdv', () => {
  describe('server side', () => {
    afterAll(() => jest.clearAllMocks())

    it("vérifie la présence d'une session", async () => {
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

    it('récupère la liste des jeunes du conseiller', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        hasSession: true,
        session: {
          user: { id: 'id-conseiller' },
          accessToken: 'accessToken',
        },
      })
      const jeunes = desJeunes()
      const jeunesService = mockedJeunesService({
        getJeunesDuConseiller: jest.fn().mockResolvedValue(jeunes),
      })
      ;(withDependance as jest.Mock).mockImplementation((dependance) => {
        if (dependance === 'jeunesService') return jeunesService
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(jeunesService.getJeunesDuConseiller).toHaveBeenCalledWith(
        'id-conseiller',
        'accessToken'
      )
      expect(actual).toMatchObject({ props: { jeunes, withoutChat: true } })
    })
  })

  describe('client side', () => {
    it('contient une section pour choisir un jeune dans une liste', () => {
      // GIVEN
      const jeunes = desJeunes()

      // WHEN
      render(<EditionRdv jeunes={jeunes} withoutChat={true} />)

      // THEN
      expect(
        screen.getByRole('group', { name: 'Étape 1 Bénéficiaires' })
      ).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      for (const jeune of jeunes) {
        const jeuneOption = screen.getByRole('option', {
          name: `${jeune.lastName} ${jeune.firstName}`,
        })
        expect(jeuneOption).toBeInTheDocument()
      }
    })
  })
})
