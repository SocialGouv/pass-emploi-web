import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import renderWithSession from '../renderWithSession'

import { desJeunes } from 'fixtures/jeune'
import { typesDeRendezVous, unRendezVous } from 'fixtures/rendez-vous'
import { mockedJeunesService, mockedRendezVousService } from 'fixtures/services'
import { Jeune } from 'interfaces/jeune'
import { Rdv, TypeRendezVous } from 'interfaces/rdv'
import EditionRdv, { getServerSideProps } from 'pages/mes-jeunes/edition-rdv'
import { modalites } from 'referentiel/rdv'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { toIsoLocalDate, toIsoLocalTime } from 'utils/date'
import { DIProvider } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('next/router')
jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('utils/date')
jest.mock('components/Modal')

describe('EditionRdv', () => {
  describe('server side', () => {
    let jeunesService: JeunesService
    let rendezVousService: RendezVousService
    let jeunes: Jeune[]
    let typesRendezVous: TypeRendezVous[]

    describe("quand l'utilisateur n'est pas connecté", () => {
      it('requiert la connexion', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: false,
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
          validSession: true,
          session: {
            user: { id: 'id-conseiller' },
            accessToken: 'accessToken',
          },
        })

        jeunes = desJeunes()
        typesRendezVous = typesDeRendezVous()

        jeunesService = mockedJeunesService({
          getJeunesDuConseiller: jest.fn().mockResolvedValue(jeunes),
        })
        rendezVousService = mockedRendezVousService({
          getTypesRendezVous: jest.fn().mockResolvedValue(typesRendezVous),
        })
        ;(withDependance as jest.Mock).mockImplementation((dependance) => {
          if (dependance === 'jeunesService') return jeunesService
          if (dependance === 'rendezVousService') return rendezVousService
        })
      })

      it('récupère la liste des jeunes du conseiller', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: {},
        } as GetServerSidePropsContext)

        // Then
        expect(jeunesService.getJeunesDuConseiller).toHaveBeenCalledWith(
          'id-conseiller',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: {
            jeunes,
            withoutChat: true,
            pageTitle: 'Nouveau rendez-vous',
          },
        })
      })

      it('récupère le referentiel des types de rendez vous', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: {},
        } as GetServerSidePropsContext)

        // Then
        expect(rendezVousService.getTypesRendezVous).toHaveBeenCalledWith(
          'accessToken'
        )
        expect(actual).toMatchObject({ props: { typesRendezVous } })
      })

      it("récupère la page d'origine", async () => {
        // When
        const actual = await getServerSideProps({
          req: {
            headers: {
              referer: '/mes-rendezvous',
            },
          },
          query: {},
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: { redirectTo: '/mes-rendezvous' },
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
          query: {},
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: { idJeune: 'id-jeune' },
        })
      })

      it('récupère le rendez-vous concerné', async () => {
        // Given
        ;(
          rendezVousService.getDetailsRendezVous as jest.Mock
        ).mockResolvedValue(unRendezVous())

        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: { idRdv: 'id-rdv' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(rendezVousService.getDetailsRendezVous).toHaveBeenCalledWith(
          'id-rdv',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: { rdv: unRendezVous(), pageTitle: 'Modification rendez-vous' },
        })
      })

      it("renvoie une 404 si le rendez-vous n'existe pas", async () => {
        // Given
        ;(
          rendezVousService.getDetailsRendezVous as jest.Mock
        ).mockResolvedValue(undefined)

        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: { idRdv: 'id-rdv' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({ notFound: true })
      })
    })
  })

  describe('client side', () => {
    let jeunes: Jeune[]
    let rendezVousService: RendezVousService
    let typesRendezVous: TypeRendezVous[]
    let push: jest.Mock
    beforeEach(() => {
      jeunes = desJeunes()
      rendezVousService = mockedRendezVousService()
      typesRendezVous = typesDeRendezVous()

      push = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({ push })
    })

    describe('contenu', () => {
      beforeEach(() => {
        // When
        renderWithSession(
          <DIProvider dependances={{ rendezVousService }}>
            <EditionRdv
              jeunes={jeunes}
              typesRendezVous={typesRendezVous}
              withoutChat={true}
              redirectTo={'/mes-rendezvous'}
              pageTitle={''}
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
          expect(link.closest('a')).toHaveAttribute('href', '/mes-rendezvous')
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
            const jeuneOption = within(selectJeune).getByRole('option', {
              name: `${jeune.lastName} ${jeune.firstName}`,
            })
            expect(jeuneOption).toBeInTheDocument()
          }
        })
      })

      describe('étape 2 type de rendez-vous', () => {
        let etape: HTMLFieldSetElement
        let selectType: HTMLSelectElement
        beforeEach(() => {
          etape = screen.getByRole('group', {
            name: 'Étape 2 Type de rendez-vous :',
          })
          selectType = within(etape).getByRole('combobox', {
            name: 'Type',
          })
        })

        it('contient une liste pour choisir un type', () => {
          // Then

          expect(selectType).toBeInTheDocument()
          expect(selectType).toHaveAttribute('required', '')
          for (const typeRendezVous of typesRendezVous) {
            expect(
              within(etape).getByRole('option', { name: typeRendezVous.label })
            ).toBeInTheDocument()
          }
        })

        describe('lorsque le type de rendez-vous est de type ENTRETIEN INDIVIDUEL CONSEILLER', () => {
          it('présence du conseiller est requise et non modifiable', () => {
            // Given
            const inputPresenceConseiller = screen.getByLabelText(
              /Vous êtes présent au rendez-vous/i
            )

            // When
            fireEvent.change(selectType, {
              target: { value: 'ENTRETIEN_INDIVIDUEL_CONSEILLER' },
            })

            // Then
            expect(inputPresenceConseiller).toBeDisabled()
          })
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

        it('contient un champ pour indiquer l’adresse si besoin', () => {
          // Then
          const inputAdresse = within(etape).getByLabelText(
            'Adresse Ex: 12 rue duc, Brest'
          )
          expect(inputAdresse).toBeInTheDocument()
          expect(inputAdresse).toHaveAttribute('type', 'text')
        })

        it('contient un champ pour indiquer un organisme si besoin', () => {
          // Then
          const inputOrganisme = within(etape).getByLabelText(
            'OrganismeEx: prestataire, entreprise, etc.'
          )
          expect(inputOrganisme).toBeInTheDocument()
          expect(inputOrganisme).toHaveAttribute('type', 'text')
        })
      })

      describe('étape 4 informations conseiller', () => {
        let etape: HTMLFieldSetElement
        let inputPresenceConseiller: HTMLInputElement
        let inputEmailInvitation: HTMLInputElement
        it('contient un champ pour indiquer la présence du conseiller à un rendez-vous', () => {
          // Given
          inputPresenceConseiller = screen.getByLabelText(
            /Vous êtes présent au rendez-vous/i
          )

          // Then

          expect(inputPresenceConseiller).toBeInTheDocument()
        })

        it('contient un champ pour demander au conseiller s’il souhaite recevoir un email d’invitation au RDV', () => {
          // Given
          inputEmailInvitation = screen.getByLabelText(
            /Intégrer ce rendez-vous à mon agenda via l’adresse mail suivante :/i
          )

          // Then

          expect(inputEmailInvitation).toBeInTheDocument()
        })

        it('indique l’email auquel le conseiller va recevoir son invitation au RDV', () => {
          // Given

          let getEmailConseiller: HTMLInputElement =
            screen.getByLabelText(/fake@email.com/i)

          // Then

          expect(getEmailConseiller).toBeInTheDocument()
        })

        it('contient un champ pour saisir des commentaires', () => {
          // Given
          etape = screen.getByRole('group', {
            name: 'Étape 4 Informations conseiller :',
          })

          // Then
          const inputCommentaires = within(etape).getByRole('textbox', {
            name: 'Notes Commentaire à destination des jeunes',
          })
          expect(inputCommentaires).toBeInTheDocument()
          expect(inputCommentaires).not.toHaveAttribute('required')
        })
      })

      it('contient un lien pour annuler', () => {
        // Then
        const link = screen.getByText('Annuler')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/mes-rendezvous')
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
          fireEvent.change(selectType, {
            target: { value: typesRendezVous[0].code },
          })
          fireEvent.change(inputDate, { target: { value: '2022-03-03' } })
          fireEvent.input(inputHoraire, { target: { value: '10:30' } })
          fireEvent.input(inputDuree, { target: { value: '02:37' } })
          fireEvent.input(inputCommentaires, {
            target: { value: 'Lorem ipsum dolor sit amet' },
          })
        })

        describe('quand le formulaire est validé', () => {
          it('crée un rendez-vous de type Generique', () => {
            // When
            buttonValider.click()

            // Then
            expect(rendezVousService.postNewRendezVous).toHaveBeenCalledWith(
              '1',
              {
                jeuneId: jeunes[0].id,
                type: 'ACTIVITES_EXTERIEURES',
                modality: modalites[0],
                precision: undefined,
                date: '2022-03-03T09:30:00.000Z',
                adresse: undefined,
                organisme: undefined,
                duration: 157,
                comment: 'Lorem ipsum dolor sit amet',
                presenceConseiller: true,
                invitation: false,
              },
              'accessToken'
            )
          })

          it('crée un rendez-vous de type AUTRE', () => {
            // Given
            fireEvent.change(selectType, { target: { value: 'AUTRE' } })

            const inputTypePrecision = screen.getByLabelText('* Préciser')
            fireEvent.change(inputTypePrecision, {
              target: { value: 'un texte de précision' },
            })

            // When
            buttonValider.click()

            // Then
            expect(rendezVousService.postNewRendezVous).toHaveBeenCalledWith(
              '1',
              {
                jeuneId: jeunes[0].id,
                type: 'AUTRE',
                precision: 'un texte de précision',
                modality: modalites[0],
                date: '2022-03-03T09:30:00.000Z',
                adresse: undefined,
                organisme: undefined,
                duration: 157,
                comment: 'Lorem ipsum dolor sit amet',
                presenceConseiller: true,
                invitation: false,
              },
              'accessToken'
            )
          })

          it('redirige vers la page précédente', async () => {
            // When
            buttonValider.click()

            await waitFor(() => {
              // Then
              expect(push).toHaveBeenCalledWith(
                '/mes-rendezvous?creationRdv=succes'
              )
            })
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
          fireEvent.change(selectType, { target: { value: 'AUTRE' } })

          // Then
          await waitFor(() => {
            expect(screen.getByLabelText('* Préciser')).toBeInTheDocument()
          })
        })

        it("affiche un message d'erreur quand type de rendez-vous 'Autre' pas rempli", async () => {
          // Given
          let inputTypePrecision: HTMLInputElement

          // When
          fireEvent.change(selectType, { target: { value: 'AUTRE' } })
          inputTypePrecision = screen.getByLabelText('* Préciser')

          await waitFor(() => {
            expect(inputTypePrecision).toBeInTheDocument()
            fireEvent.blur(inputTypePrecision)
          })

          // Then
          expect(inputTypePrecision.value).toEqual('')
          expect(
            screen.getByText(
              "Le champ Préciser n'est pas renseigné. Veuillez préciser le type de rendez-vous."
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

        it('prévient avant de revenir à la page précédente', async () => {
          // Given
          const button = screen.getByText('Quitter la création du rendez-vous')

          // When
          await act(async () => button.click())

          // Then
          expect(() => screen.getByText('Page précédente')).toThrow()
          expect(button).not.toHaveAttribute('href')
          expect(push).not.toHaveBeenCalled()
          expect(
            screen.getByText(
              'Vous allez quitter la création d’un nouveau rendez-vous'
            )
          ).toBeInTheDocument()
        })

        it("prévient avant d'annuler", async () => {
          // Given
          const button = screen.getByText('Annuler')

          // When
          await act(async () => button.click())

          // Then
          expect(button).not.toHaveAttribute('href')
          expect(push).not.toHaveBeenCalled()
          expect(
            screen.getByText(
              'Vous allez quitter la création d’un nouveau rendez-vous'
            )
          ).toBeInTheDocument()
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
              typesRendezVous={typesRendezVous}
              withoutChat={true}
              redirectTo={'/mes-rendezvous'}
              idJeune={idJeune}
              pageTitle={''}
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

    describe('quand on souhaite modifier un rdv existant', () => {
      let rdv: Rdv
      beforeEach(() => {
        ;(toIsoLocalDate as jest.Mock).mockReturnValue('2021-10-21')
        ;(toIsoLocalTime as jest.Mock).mockReturnValue('12:00:00.000+02:00')
        // Given
        const jeune = {
          id: jeunes[0].id,
          prenom: jeunes[0].firstName,
          nom: jeunes[0].lastName,
        }

        rdv = unRendezVous({ jeune })

        // When
        renderWithSession(
          <DIProvider dependances={{ rendezVousService }}>
            <EditionRdv
              jeunes={jeunes}
              typesRendezVous={typesRendezVous}
              withoutChat={true}
              redirectTo={'/mes-rendezvous?creationRdv=succes'}
              rdv={rdv}
              pageTitle={''}
            />
          </DIProvider>
        )
      })

      it('initialise les champs avec les données du rdv', () => {
        // Then
        expect(
          screen.getByLabelText<HTMLSelectElement>(/ajouter un jeune/).value
        ).toEqual(rdv.jeune.id)
        expect(screen.getByLabelText<HTMLSelectElement>(/Type/).value).toEqual(
          rdv.type.code
        )
        expect(
          screen.getByLabelText<HTMLSelectElement>(/Préciser/).value
        ).toEqual(rdv.precisionType)
        expect(
          screen.getByLabelText<HTMLSelectElement>(/Modalité/).value
        ).toEqual(rdv.modality)
        expect(screen.getByLabelText<HTMLInputElement>(/Date/).value).toEqual(
          '2021-10-21'
        )
        expect(screen.getByLabelText<HTMLSelectElement>(/Heure/).value).toEqual(
          '12:00'
        )
        expect(screen.getByLabelText<HTMLSelectElement>(/Durée/).value).toEqual(
          '02:05'
        )
        expect(
          screen.getByLabelText<HTMLInputElement>(/Adresse/).value
        ).toEqual('36 rue de marseille, 93200 Saint-Denis')
        expect(
          screen.getByLabelText<HTMLInputElement>(/Organisme/).value
        ).toEqual('S.A.R.L')
        expect(
          screen.getByLabelText<HTMLInputElement>(/présent/).checked
        ).toEqual(false)
        expect(
          screen.getByLabelText<HTMLInputElement>(/agenda/).checked
        ).toEqual(true)
        expect(
          screen.getByLabelText<HTMLInputElement>(/Commentaire/).value
        ).toEqual('Rendez-vous avec Kenji')
      })

      it('désactive les champs non modifiable', () => {
        // Then
        expect(
          screen.getByLabelText<HTMLSelectElement>(/ajouter un jeune/)
        ).toBeDisabled()
        expect(screen.getByLabelText<HTMLSelectElement>(/Type/)).toBeDisabled()
        expect(
          screen.getByLabelText<HTMLSelectElement>(/Préciser/)
        ).toBeDisabled()
        expect(screen.getByLabelText<HTMLInputElement>(/agenda/)).toBeDisabled()
      })

      it('permet de revenir à la page précédente', () => {
        // Then
        const link = screen.getByText('Page précédente')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('class', 'sr-only')
        expect(link.closest('a')).toHaveAttribute(
          'href',
          '/mes-rendezvous?creationRdv=succes'
        )
      })

      it('contient un lien pour annuler', () => {
        // Then
        const link = screen.getByText('Annuler')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          '/mes-rendezvous?creationRdv=succes'
        )
      })

      describe('rendez-vous modifié', () => {
        let selectModalite: HTMLSelectElement
        let inputDate: HTMLInputElement
        let inputHoraire: HTMLInputElement
        let inputDuree: HTMLInputElement
        let inputCommentaires: HTMLTextAreaElement
        let buttonValider: HTMLButtonElement
        beforeEach(() => {
          // Given
          selectModalite = screen.getByRole('combobox', {
            name: 'Modalité',
          })
          inputDate = screen.getByLabelText('* Date Format : JJ/MM/AAAA')
          inputHoraire = screen.getByLabelText('* Heure Format : HH:MM')
          inputDuree = screen.getByLabelText('* Durée Format : HH:MM')
          inputCommentaires = screen.getByRole('textbox', {
            name: 'Notes Commentaire à destination des jeunes',
          })

          buttonValider = screen.getByRole('button', { name: 'Envoyer' })

          // Given
          fireEvent.change(selectModalite, { target: { value: modalites[0] } })
          fireEvent.change(inputDate, { target: { value: '2022-03-03' } })
          fireEvent.input(inputHoraire, { target: { value: '10:30' } })
          fireEvent.input(inputDuree, { target: { value: '02:37' } })
          fireEvent.input(inputCommentaires, {
            target: { value: 'Lorem ipsum dolor sit amet' },
          })
        })

        it('prévient avant de revenir à la page précédente', async () => {
          // Given
          const button = screen.getByText(
            'Quitter la modification du rendez-vous'
          )

          // When
          await act(async () => button.click())

          // Then
          expect(() => screen.getByText('Page précédente')).toThrow()
          expect(button).not.toHaveAttribute('href')
          expect(push).not.toHaveBeenCalled()
          expect(
            screen.getByText(
              'Vous allez quitter la modification du rendez-vous'
            )
          ).toBeInTheDocument()
        })

        it("prévient avant d'annuler", async () => {
          // Given
          const button = screen.getByText('Annuler')

          // When
          await act(async () => button.click())

          // Then
          expect(button).not.toHaveAttribute('href')
          expect(push).not.toHaveBeenCalled()
          expect(
            screen.getByText(
              'Vous allez quitter la modification du rendez-vous'
            )
          ).toBeInTheDocument()
        })

        describe('quand le formulaire est validé', () => {
          it('modifie le rendez-vous', async () => {
            // When
            await act(async () => buttonValider.click())

            // Then
            expect(rendezVousService.updateRendezVous).toHaveBeenCalledWith(
              rdv.id,
              {
                jeuneId: jeunes[0].id,
                type: 'AUTRE',
                modality: modalites[0],
                precision: 'Prise de nouvelles',
                date: '2022-03-03T09:30:00.000Z',
                adresse: '36 rue de marseille, 93200 Saint-Denis',
                organisme: 'S.A.R.L',
                duration: 157,
                comment: 'Lorem ipsum dolor sit amet',
                presenceConseiller: false,
                invitation: true,
              },
              'accessToken'
            )
          })

          it('redirige vers la page précédente', async () => {
            // When
            await act(async () => buttonValider.click())

            // Then
            expect(push).toHaveBeenCalledWith(
              '/mes-rendezvous?modificationRdv=succes'
            )
          })
        })
      })
    })
  })
})
