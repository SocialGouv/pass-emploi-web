import { fireEvent, screen, within } from '@testing-library/react'
import { desJeunes } from 'fixtures/jeune'
import { mockedJeunesService, mockedRendezVousService } from 'fixtures/services'
import { Jeune } from 'interfaces/jeune'
import { GetServerSidePropsContext } from 'next/types'
import EditionRdv, { getServerSideProps } from 'pages/mes-jeunes/edition-rdv'
import { modalites } from 'referentiel/rdv'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import { DIProvider } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import renderWithSession from '../renderWithSession'

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
    let rendezVousService: RendezVousService
    beforeEach(() => {
      // Given
      jeunes = desJeunes()
      rendezVousService = mockedRendezVousService()

      // When
      renderWithSession(
        <DIProvider dependances={{ rendezVousService }}>
          <EditionRdv
            jeunes={jeunes}
            withoutChat={true}
            from={'/mes-rendezvous'}
          />
        </DIProvider>
      )
    })

    describe('header', () => {
      it('contient un titre', () => {
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

    describe('étape 4 informations conseiller', () => {
      let etape: HTMLFieldSetElement
      beforeEach(() => {
        etape = screen.getByRole('group', {
          name: 'Étape 4 Informations conseiller :',
        })
      })

      it('contient un champ pour saisir des commentaires', () => {
        // Then
        const inputCommentaires = within(etape).getByRole('textbox', {
          name: 'Notes Commentaire à destination des jeunes',
        })
        expect(inputCommentaires).toBeInTheDocument()
        expect(inputCommentaires).not.toHaveAttribute('required')
      })
    })

    describe('validation du formulaire', () => {
      let selectJeune: HTMLSelectElement
      let selectModalite: HTMLSelectElement
      let inputDate: HTMLInputElement
      let inputHoraire: HTMLInputElement
      let inputDuree: HTMLInputElement
      let inputCommentaires: HTMLTextAreaElement
      let buttonValider: HTMLButtonElement
      beforeEach(() => {
        // Given
        selectJeune = screen.getByRole('combobox', {
          name: 'Rechercher et ajouter un jeune Nom et prénom',
        })
        selectModalite = screen.getByRole('combobox', {
          name: 'Modalité',
        })
        inputDate = screen.getByLabelText('* Date Format : JJ/MM/AAAA')
        inputHoraire = screen.getByLabelText('* Heure Format : HH:MM')
        inputDuree = screen.getByLabelText('* Durée (en minutes)')
        inputCommentaires = screen.getByRole('textbox', {
          name: 'Notes Commentaire à destination des jeunes',
        })

        buttonValider = screen.getByRole('button', { name: 'Envoyer' })

        // Given
        fireEvent.change(selectJeune, { target: { value: jeunes[0].id } })
        fireEvent.change(selectModalite, { target: { value: modalites[0] } })
        fireEvent.change(inputDate, { target: { value: '2022-03-03' } })
        fireEvent.input(inputHoraire, { target: { value: '10:30' } })
        fireEvent.input(inputDuree, { target: { value: '180' } })
        fireEvent.input(inputCommentaires, {
          target: { value: 'Lorem ipsum dolor sit amet' },
        })
      })

      it('crée le rdv', () => {
        // When
        buttonValider.click()

        // Then
        expect(rendezVousService.postNewRendezVous).toHaveBeenCalledWith(
          '1',
          {
            jeuneId: jeunes[0].id,
            modality: modalites[0],
            date: '2022-03-03T09:30:00.000Z',
            duration: 180,
            comment: 'Lorem ipsum dolor sit amet',
          },
          'accessToken'
        )
      })

      it("est désactivé quand aucun jeune n'est selectionné", () => {
        // When
        fireEvent.change(selectJeune, { target: { value: '' } })

        // Then
        expect(buttonValider).toHaveAttribute('disabled', '')
      })

      it("est désactivé quand aucune modalité n'est selectionnée", () => {
        // When
        fireEvent.change(selectModalite, { target: { value: '' } })

        // Then
        expect(buttonValider).toHaveAttribute('disabled', '')
      })

      it("est désactivé quand aucune date n'est selectionnée", () => {
        // When
        fireEvent.change(inputDate, { target: { value: '' } })

        // Then
        expect(buttonValider).toHaveAttribute('disabled', '')
      })

      it("est désactivé quand aucune horaire n'est renseignée", () => {
        // When
        fireEvent.input(inputHoraire, { target: { value: '' } })

        // Then
        expect(buttonValider).toHaveAttribute('disabled', '')
      })

      it("est désactivé quand l'horaire est incorrecte", () => {
        // When
        fireEvent.input(inputHoraire, { target: { value: '123:45' } })

        // Then
        expect(buttonValider).toHaveAttribute('disabled', '')
      })

      it("est désactivé quand aucune durée n'est renseignée", () => {
        // When
        fireEvent.input(inputDuree, { target: { value: '' } })

        // Then
        expect(buttonValider).toHaveAttribute('disabled', '')
      })
    })
  })
})
