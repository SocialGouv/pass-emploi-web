import { render, screen, within } from '@testing-library/react'
import { desJeunes } from 'fixtures/jeune'
import { mockedJeunesService } from 'fixtures/services'
import { Jeune } from 'interfaces/jeune'
import { GetServerSidePropsContext } from 'next/types'
import EditionRdv, { getServerSideProps } from 'pages/mes-jeunes/edition-rdv'
import { modalites } from 'referentiel/rdv'
import { JeunesService } from 'services/jeunes.service'
import withDependance from 'utils/injectionDependances/withDependance'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'

jest.mock('utils/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('EditionRdv', () => {
  describe('server side', () => {
    afterAll(() => jest.clearAllMocks())

    let jeunesService: JeunesService
    let jeunes: Jeune[]
    describe("quand l'utilisateur n'est pas connecté", () => {
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

    describe("quand l'utilisateur est connecté", () => {
      beforeEach(() => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          hasSession: true,
          session: {
            user: { id: 'id-conseiller' },
            accessToken: 'accessToken',
          },
        })

        jeunes = desJeunes()
        jeunesService = mockedJeunesService({
          getJeunesDuConseiller: jest.fn().mockResolvedValue(jeunes),
        })
        ;(withDependance as jest.Mock).mockImplementation((dependance) => {
          if (dependance === 'jeunesService') return jeunesService
        })
      })

      it('récupère la liste des jeunes du conseiller', async () => {
        // When
        const actual = await getServerSideProps({
          query: {},
        } as GetServerSidePropsContext)

        // Then
        expect(jeunesService.getJeunesDuConseiller).toHaveBeenCalledWith(
          'id-conseiller',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: { jeunes, withoutChat: true, from: '/mes-jeunes' },
        })
      })

      it("récupère la page d'origine", async () => {
        // When
        const actual = await getServerSideProps({
          query: { from: '/mes-rendezvous' },
        } as unknown as GetServerSidePropsContext<{ from: string }>)

        // Then
        expect(jeunesService.getJeunesDuConseiller).toHaveBeenCalledWith(
          'id-conseiller',
          'accessToken'
        )
        expect(actual).toMatchObject({ props: { from: '/mes-rendezvous' } })
      })
    })
  })

  describe('client side', () => {
    let jeunes: Jeune[]
    beforeEach(() => {
      // Given
      jeunes = desJeunes()

      // When
      render(
        <EditionRdv
          jeunes={jeunes}
          withoutChat={true}
          from={'/mes-rendezvous'}
        />
      )
    })

    it('contient un header', () => {
      // Then
      expect(
        screen.getByRole('heading', { level: 1, name: 'Nouveau rendez-vous' })
      ).toBeInTheDocument()
    })

    it('permet de revenir à la page précédente', () => {
      // Then
      const link = screen.getByRole('link', { name: 'Page précédente' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/mes-rendezvous')
    })

    describe('étape 1 bénéficiaires', () => {
      let etape: HTMLFieldSetElement
      beforeEach(() => {
        etape = screen.getByRole('group', { name: 'Étape 1 Bénéficiaires :' })
      })

      it('contient une liste pour choisir un jeune', () => {
        // Then
        const selectJeune = within(etape).getByRole('combobox', {
          name: 'Rechercher et ajouter un jeune Nom et prénom',
        })
        expect(selectJeune).toBeInTheDocument()
        expect(selectJeune).toHaveAttribute('required', '')
        for (const jeune of jeunes) {
          const jeuneOption = within(etape).getByRole('option', {
            name: `${jeune.lastName} ${jeune.firstName}`,
          })
          expect(jeuneOption).toBeInTheDocument()
        }
      })
    })

    describe('étape 2 type de rendez-vous', () => {
      let etape: HTMLFieldSetElement
      beforeEach(() => {
        etape = screen.getByRole('group', {
          name: 'Étape 2 Type de rendez-vous :',
        })
      })

      it('contient une liste pour choisir une modalité', () => {
        // Then
        const selectModalite = within(etape).getByRole('combobox', {
          name: 'Modalité',
        })
        expect(selectModalite).toBeInTheDocument()
        expect(selectModalite).toHaveAttribute('required', '')
        for (const modalite of modalites) {
          expect(
            within(etape).getByRole('option', { name: modalite })
          ).toBeInTheDocument()
        }
      })
    })

    describe('étape 3 lieu et date', () => {
      let etape: HTMLFieldSetElement
      beforeEach(() => {
        etape = screen.getByRole('group', { name: 'Étape 3 Lieu et date :' })
      })

      it('contient un champ pour choisir la date', () => {
        // Then
        const inputDate = within(etape).getByLabelText(
          '* Date Format : JJ/MM/AAAA'
        )
        expect(inputDate).toBeInTheDocument()
        expect(inputDate).toHaveAttribute('required', '')
        expect(inputDate).toHaveAttribute('type', 'date')
      })

      it("contient un champ pour choisir l'horaire", () => {
        // Then
        const inputHoraire = within(etape).getByLabelText(
          '* Heure Format : HH:MM'
        )
        expect(inputHoraire).toBeInTheDocument()
        expect(inputHoraire).toHaveAttribute('required', '')
        expect(inputHoraire).toHaveAttribute('type', 'text')
      })

      it('contient un champ pour choisir la durée', () => {
        // Then
        const inputDuree = within(etape).getByLabelText('* Durée (en minutes)')
        expect(inputDuree).toBeInTheDocument()
        expect(inputDuree).toHaveAttribute('required', '')
        expect(inputDuree).toHaveAttribute('type', 'number')
      })
    })
  })
})
