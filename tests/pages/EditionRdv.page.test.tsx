import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { desJeunes } from 'fixtures/jeune'
import { mockedJeunesService, mockedRendezVousService } from 'fixtures/services'
import { Jeune } from 'interfaces/jeune'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import EditionRdv, { getServerSideProps } from 'pages/mes-jeunes/edition-rdv'
import { modalites, types } from 'referentiel/rdv'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import { DIProvider } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import renderWithSession from '../renderWithSession'
import { TypeRendezVous } from 'interfaces/rdv'

jest.mock('utils/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('next/router')

describe('EditionRdv', () => {
  afterAll(() => jest.clearAllMocks())

  describe('server side', () => {
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
          req: {
            headers: {},
          },
        } as GetServerSidePropsContext)

        // Then
        expect(jeunesService.getJeunesDuConseiller).toHaveBeenCalledWith(
          'id-conseiller',
          'accessToken'
        )
        expect(actual).toEqual({
          props: {
            jeunes,
            withoutChat: true,
            from: '/mes-jeunes',
          },
        })
      })

      it("récupère la page d'origine", async () => {
        // When
        const actual = await getServerSideProps({
          req: {
            headers: {
              referer: '/mes-rendezvous',
            },
          },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(jeunesService.getJeunesDuConseiller).toHaveBeenCalledWith(
          'id-conseiller',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: { from: '/mes-rendezvous' },
        })
      })

      it('récupère le jeune concerné', async () => {
        // When
        const actual = await getServerSideProps({
          req: {
            headers: {
              referer: '/mes-jeunes/id-jeune',
            },
          },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(jeunesService.getJeunesDuConseiller).toHaveBeenCalledWith(
          'id-conseiller',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: { idJeuneFrom: 'id-jeune' },
        })
      })
    })
  })

  describe('client side', () => {
    let jeunes: Jeune[]
    let rendezVousService: RendezVousService
    beforeEach(() => {
      jeunes = desJeunes()
      rendezVousService = mockedRendezVousService()
    })

    describe('contenu', () => {
      let push: jest.Mock
      beforeEach(() => {
        // Given
        push = jest.fn(() => Promise.resolve())
        ;(useRouter as jest.Mock).mockReturnValue({ push })

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
            screen.getByRole('heading', {
              level: 1,
              name: 'Nouveau rendez-vous',
            })
          ).toBeInTheDocument()
        })

        it('permet de revenir à la page précédente', () => {
          // Then
          const link = screen.getByText('Page précédente')
          expect(link).toBeInTheDocument()
          expect(link).toHaveAttribute('class', 'sr-only')
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

        it('contient une liste pour choisir un type', () => {
          // Then
          const selectType = within(etape).getByRole('combobox', {
            name: 'Type',
          })

          expect(selectType).toBeInTheDocument()
          expect(selectType).toHaveAttribute('required', '')
          for (const typeRendezVous of types) {
            expect(
              within(etape).getByRole('option', { name: typeRendezVous })
            ).toBeInTheDocument()
          }
        })

        it('contient une liste pour choisir une modalité', () => {
          // Then
          const selectModalite = within(etape).getByRole('combobox', {
            name: 'Modalité',
          })
          expect(selectModalite).toBeInTheDocument()
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
          const inputDuree = within(etape).getByLabelText(
            '* Durée Format : HH:MM'
          )
          expect(inputDuree).toBeInTheDocument()
          expect(inputDuree).toHaveAttribute('required', '')
          expect(inputDuree).toHaveAttribute('type', 'text')
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

      it('contient un bouton pour annuler', () => {
        // Then
        const link = screen.getByText('Annuler')
        expect(link).toBeInTheDocument()
      })

      describe('formulaire rempli', () => {
        let selectJeune: HTMLSelectElement
        let selectModalite: HTMLSelectElement
        let selectType: HTMLSelectElement
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
          selectType = screen.getByRole('combobox', {
            name: 'Type',
          })
          inputDate = screen.getByLabelText('* Date Format : JJ/MM/AAAA')
          inputHoraire = screen.getByLabelText('* Heure Format : HH:MM')
          inputDuree = screen.getByLabelText('* Durée Format : HH:MM')
          inputCommentaires = screen.getByRole('textbox', {
            name: 'Notes Commentaire à destination des jeunes',
          })

          buttonValider = screen.getByRole('button', { name: 'Envoyer' })

          // Given
          fireEvent.change(selectJeune, { target: { value: jeunes[0].id } })
          fireEvent.change(selectModalite, { target: { value: modalites[0] } })
          fireEvent.change(selectType, { target: { value: types[0] } })
          fireEvent.change(inputDate, { target: { value: '2022-03-03' } })
          fireEvent.input(inputHoraire, { target: { value: '10:30' } })
          fireEvent.input(inputDuree, { target: { value: '02:37' } })
          fireEvent.input(inputCommentaires, {
            target: { value: 'Lorem ipsum dolor sit amet' },
          })
        })

        describe('quand le formulaire est validé', () => {
          beforeEach(() => {
            // When
            buttonValider.click()
          })

          it('crée le rdv', () => {
            // Then
            expect(rendezVousService.postNewRendezVous).toHaveBeenCalledWith(
              '1',
              {
                jeuneId: jeunes[0].id,
                type: TypeRendezVous.ACTIVITE_EXTERIEURES,
                modality: modalites[0],
                date: '2022-03-03T09:30:00.000Z',
                duration: 157,
                comment: 'Lorem ipsum dolor sit amet',
              },
              'accessToken'
            )
          })

          it('redirige vers la page précédente', () => {
            // Then
            expect(push).toHaveBeenCalledWith(
              '/mes-rendezvous?creationRdv=succes'
            )
          })
        })

        it("est désactivé quand aucun jeune n'est sélectionné", () => {
          // When
          fireEvent.change(selectJeune, { target: { value: '' } })

          // Then
          expect(buttonValider).toHaveAttribute('disabled', '')
        })

        it("est désactivé quand aucun type de rendez-vous n'est sélectionné", () => {
          // When
          fireEvent.change(selectType, { target: { value: '' } })

          // Then
          expect(buttonValider).toHaveAttribute('disabled', '')
        })

        it('affiche le champ de saisie pour spécifier le type Autre', async () => {
          // Given
          // When
          fireEvent.change(selectType, { target: { value: 'Autre' } })

          // Then
          await waitFor(() => {
            expect(screen.getByLabelText('* Précisez')).toBeInTheDocument()
          })
        })

        it("affiche un message d'erreur quand type de rendez-vous 'Autre' pas rempli", async () => {
          // Given
          let inputAutreType: HTMLInputElement

          // When
          fireEvent.change(selectType, { target: { value: 'Autre' } })
          inputAutreType = screen.getByLabelText('* Précisez')

          await waitFor(() => {
            expect(inputAutreType).toBeInTheDocument()
            fireEvent.blur(inputAutreType)
          })

          // Then
          expect(inputAutreType.value).toEqual('')
          expect(
            screen.getByText(
              "Le champ type n'est pas renseigné. Veuillez préciser le type de rendez-vous."
            )
          ).toBeInTheDocument()
        })

        it("est désactivé quand aucune date n'est sélectionnée", () => {
          // When
          fireEvent.change(inputDate, { target: { value: '' } })
          fireEvent.blur(inputDate)

          // Then
          expect(buttonValider).toHaveAttribute('disabled', '')
          expect(
            screen.getByText(
              "Le champ date n'est pas valide. Veuillez respecter le format JJ/MM/AAAA"
            )
          ).toBeInTheDocument()
        })

        it('est désactivé quand la date est incorrecte', () => {
          // When
          fireEvent.input(inputDate, { target: { value: 'yyyy-06-06' } })
          fireEvent.blur(inputDate)

          // Then
          expect(buttonValider).toHaveAttribute('disabled', '')
          expect(
            screen.getByText(
              "Le champ date n'est pas valide. Veuillez respecter le format JJ/MM/AAAA"
            )
          ).toBeInTheDocument()
        })

        it("est désactivé quand aucune horaire n'est renseignée", () => {
          // When
          fireEvent.input(inputHoraire, { target: { value: '' } })
          fireEvent.blur(inputHoraire)

          // Then
          expect(buttonValider).toHaveAttribute('disabled', '')
          expect(
            screen.getByText(
              "Le champ heure n'est pas renseigné. Veuillez renseigner une heure."
            )
          ).toBeInTheDocument()
        })

        it("est désactivé quand l'horaire est incorrecte", () => {
          // When
          fireEvent.input(inputHoraire, { target: { value: '123:45' } })
          fireEvent.blur(inputHoraire)

          // Then
          expect(buttonValider).toHaveAttribute('disabled', '')
          expect(
            screen.getByText(
              "Le champ heure n'est pas valide. Veuillez respecter le format HH:MM"
            )
          ).toBeInTheDocument()
        })

        it("est désactivé quand aucune durée n'est renseignée", () => {
          // When
          fireEvent.input(inputDuree, { target: { value: '' } })
          fireEvent.blur(inputDuree)

          // Then
          expect(buttonValider).toHaveAttribute('disabled', '')
          expect(
            screen.getByText(
              "Le champ durée n'est pas renseigné. Veuillez renseigner une durée."
            )
          ).toBeInTheDocument()
        })

        it('est désactivé quand la durée est incorrecte', () => {
          // When
          fireEvent.input(inputDuree, { target: { value: '123:45' } })
          fireEvent.blur(inputDuree)

          // Then
          expect(buttonValider).toHaveAttribute('disabled', '')
          expect(
            screen.getByText(
              "Le champ durée n'est pas valide. Veuillez respecter le format HH:MM"
            )
          ).toBeInTheDocument()
        })

        it('prévient avant de revenir à la page précédente', () => {
          // Given
          const button = screen.getByText('Quitter la création du rendez-vous')

          // When
          button.click()

          // Then
          expect(() => screen.getByText('Page précédente')).toThrow()
          expect(button).not.toHaveAttribute('href')
          expect(push).not.toHaveBeenCalled()
          // TODO comment tester la modal ?
          // const modalRoot: any = screen.getByTestId('modal-root')
          // const actual: any = within(modalRoot).getByText('Quitter la page ?')
          // expect(actual).toBeInTheDocument()
        })

        it("prévient avant d'annuler", () => {
          // Given
          const button = screen.getByText('Annuler')

          // When
          button.click()

          // Then
          expect(button).not.toHaveAttribute('href')
          expect(push).not.toHaveBeenCalled()
          // TODO comment tester la modal ?
          // const modalRoot: any = screen.getByTestId('modal-root')
          // const actual: any = within(modalRoot).getByText('Quitter la page ?')
          // expect(actual).toBeInTheDocument()
        })
      })
    })

    describe('quand un id de jeune est spécifié', () => {
      it('initialise et fige le destinataire', () => {
        // Given
        const idJeune = jeunes[2].id

        // When
        renderWithSession(
          <DIProvider dependances={{ rendezVousService }}>
            <EditionRdv
              jeunes={jeunes}
              withoutChat={true}
              from={'/mes-rendezvous'}
              idJeuneFrom={idJeune}
            />
          </DIProvider>
        )

        // Then
        const selectJeune = screen.getByRole('combobox', {
          name: 'Rechercher et ajouter un jeune Nom et prénom',
        })
        expect(selectJeune).toHaveValue(idJeune)
        expect(selectJeune).toHaveAttribute('disabled', '')
      })
    })
  })
})
