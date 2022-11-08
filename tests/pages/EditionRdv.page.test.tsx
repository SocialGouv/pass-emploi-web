import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import { desItemsJeunes, uneBaseJeune } from 'fixtures/jeune'
import { uneListeDAgencesMILO } from 'fixtures/referentiel'
import { typesDeRendezVous, unRendezVous } from 'fixtures/rendez-vous'
import {
  mockedConseillerService,
  mockedJeunesService,
  mockedReferentielService,
  mockedRendezVousService,
} from 'fixtures/services'
import { StructureConseiller } from 'interfaces/conseiller'
import { BaseJeune, getNomJeuneComplet, JeuneFromListe } from 'interfaces/jeune'
import { Rdv, TypeRendezVous } from 'interfaces/rdv'
import { Agence } from 'interfaces/referentiel'
import EditionRdv, { getServerSideProps } from 'pages/mes-jeunes/edition-rdv'
import { modalites } from 'referentiel/rdv'
import { ConseillerService } from 'services/conseiller.service'
import { JeunesService } from 'services/jeunes.service'
import { ReferentielService } from 'services/referentiel.service'
import { RendezVousService } from 'services/rendez-vous.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('components/Modal')

describe('EditionRdv', () => {
  describe('server side', () => {
    let jeunesService: JeunesService
    let rendezVousService: RendezVousService
    let jeunes: JeuneFromListe[]
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

        jeunes = desItemsJeunes()
        typesRendezVous = typesDeRendezVous()

        jeunesService = mockedJeunesService({
          getJeunesDuConseillerServerSide: jest.fn().mockResolvedValue(jeunes),
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
        expect(
          jeunesService.getJeunesDuConseillerServerSide
        ).toHaveBeenCalledWith('id-conseiller', 'accessToken')
        expect(actual).toEqual({
          props: {
            jeunes: [jeunes[2], jeunes[0], jeunes[1]],
            withoutChat: true,
            pageTitle: 'Mes rendez-vous - Créer',
            pageHeader: 'Créer un nouveau rendez-vous',
            returnTo: '/mes-jeunes',
            typesRendezVous: expect.arrayContaining([]),
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
          props: { returnTo: '/mes-rendezvous' },
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
          props: {
            rdv: unRendezVous(),
            pageTitle: 'Mes rendez-vous - Modifier',
            pageHeader: 'Modifier le rendez-vous',
          },
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

    describe('quand l’utilisateur est Pole Emploi', () => {
      it('renvoie sur la liste des jeunes', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: {
              id: 'id-conseiller',
              structure: StructureConseiller.POLE_EMPLOI,
            },
            accessToken: 'accessToken',
          },
        })

        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: {},
        } as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          redirect: { destination: '/mes-jeunes', permanent: false },
        })
      })
    })
  })

  describe('client side', () => {
    let jeunes: JeuneFromListe[]
    let jeunesEtablissement: BaseJeune[]
    let rendezVousService: RendezVousService
    let jeunesService: JeunesService
    let typesRendezVous: TypeRendezVous[]
    let push: Function
    beforeEach(() => {
      jeunes = desItemsJeunes()
      jeunesEtablissement = [
        uneBaseJeune(),
        uneBaseJeune({ id: '2', prenom: 'Nadia' }),
      ]
      rendezVousService = mockedRendezVousService({
        deleteRendezVous: jest.fn(async () => undefined),
      })
      jeunesService = mockedJeunesService({
        getJeunesDeLEtablissement: jest.fn(async () => jeunesEtablissement),
      })
      typesRendezVous = typesDeRendezVous()

      push = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({ push })
    })

    describe('contenu', () => {
      beforeEach(() => {
        // When
        renderWithContexts(
          <EditionRdv
            jeunes={jeunes}
            typesRendezVous={typesRendezVous}
            withoutChat={true}
            returnTo={'/mes-rendezvous'}
            pageTitle={''}
          />,
          {
            customDependances: { rendezVousService },
            customConseiller: { email: 'fake@email.com' },
          }
        )
      })

      describe('header', () => {
        it("ne contient pas de message pour prévenir qu'il y a des jeunes qui ne sont pas au conseiller", () => {
          // Then
          expect(() =>
            screen.getByText(/des jeunes que vous ne suivez pas/)
          ).toThrow()
        })
      })

      describe('étape 1 type d’événements', () => {
        let etape: HTMLFieldSetElement
        let selectType: HTMLSelectElement
        beforeEach(() => {
          etape = screen.getByRole('group', {
            name: 'Étape 1 Type d’événement',
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

        it('n’affiche pas les autres étapes quand le type n’est pas sélectionné', () => {
          // Then
          expect(() => screen.getByRole('group', { name: /Étape 2/ })).toThrow()
          expect(() => screen.getByRole('group', { name: /Étape 3/ })).toThrow()
          expect(() => screen.getByRole('group', { name: /Étape 4/ })).toThrow()
        })

        describe('lorsque le type de rendez-vous est de type ENTRETIEN INDIVIDUEL CONSEILLER', () => {
          it('présence du conseiller est requise et non modifiable', async () => {
            // When
            await userEvent.selectOptions(
              selectType,
              'ENTRETIEN_INDIVIDUEL_CONSEILLER'
            )

            // Then
            const inputPresenceConseiller = screen.getByLabelText(
              /Informer les bénéficiaires qu’un conseiller sera présent au rendez-vous/i
            )

            expect(inputPresenceConseiller).toBeDisabled()
          })
        })
      })

      describe('étape 2 bénéficiaires', () => {
        let etape: HTMLFieldSetElement

        beforeEach(async () => {
          const selectType = screen.getByRole('combobox', {
            name: 'Type',
          })
          await userEvent.selectOptions(selectType, 'Activités extérieures')
          etape = screen.getByRole('group', { name: 'Étape 2 Bénéficiaires' })
        })

        it('contient une liste pour choisir un jeune', () => {
          // Then
          const selectJeune = within(etape).getByRole('combobox', {
            name: 'Rechercher et ajouter des jeunes Nom et prénom',
          })
          const options = within(etape).getByRole('listbox', { hidden: true })

          expect(selectJeune).toHaveAttribute('aria-required', 'true')
          expect(selectJeune).toHaveAttribute('multiple', '')
          for (const jeune of jeunes) {
            const jeuneOption = within(options).getByRole('option', {
              name: `${jeune.nom} ${jeune.prenom}`,
              hidden: true,
            })
            expect(jeuneOption).toBeInTheDocument()
          }
        })
      })

      describe('étape 3 lieu et date', () => {
        let etape: HTMLFieldSetElement
        beforeEach(async () => {
          const selectType = screen.getByRole('combobox', {
            name: 'Type',
          })
          await userEvent.selectOptions(selectType, 'Activités extérieures')
          etape = screen.getByRole('group', { name: 'Étape 3 Lieu et date' })
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

        it('contient un champ pour choisir la date', () => {
          // Then
          const inputDate = within(etape).getByLabelText(
            '* Date (format : jj/mm/aaaa)'
          )
          expect(inputDate).toBeInTheDocument()
          expect(inputDate).toHaveAttribute('required', '')
          expect(inputDate).toHaveAttribute('type', 'date')
        })

        it("contient un champ pour choisir l'horaire", () => {
          // Then
          const inputHoraire = within(etape).getByLabelText(
            '* Heure (format : hh:mm)'
          )
          expect(inputHoraire).toBeInTheDocument()
          expect(inputHoraire).toHaveAttribute('required', '')
          expect(inputHoraire).toHaveAttribute('type', 'time')
        })

        it('contient un champ pour choisir la durée', () => {
          // Then
          const inputDuree = within(etape).getByLabelText(
            '* Durée (format : hh:mm)'
          )
          expect(inputDuree).toBeInTheDocument()
          expect(inputDuree).toHaveAttribute('required', '')
          expect(inputDuree).toHaveAttribute('type', 'time')
        })

        it('contient un champ pour indiquer l’adresse si besoin', () => {
          // Then
          const inputAdresse = within(etape).getByLabelText(
            'Adresse Ex : 12 rue duc, Brest'
          )
          expect(inputAdresse).toBeInTheDocument()
          expect(inputAdresse).toHaveAttribute('type', 'text')
        })

        it('contient un champ pour indiquer un organisme si besoin', () => {
          // Then
          const inputOrganisme = within(etape).getByLabelText(
            'Organisme Ex : prestataire, entreprise, etc.'
          )
          expect(inputOrganisme).toBeInTheDocument()
          expect(inputOrganisme).toHaveAttribute('type', 'text')
        })
      })

      describe('étape 4 informations conseiller', () => {
        let etape: HTMLFieldSetElement
        let inputPresenceConseiller: HTMLInputElement
        let inputEmailInvitation: HTMLInputElement
        beforeEach(async () => {
          const selectType = screen.getByRole('combobox', {
            name: 'Type',
          })
          await userEvent.selectOptions(selectType, 'Activités extérieures')
          etape = screen.getByRole('group', {
            name: 'Étape 4 Informations conseiller',
          })
        })
        it('contient un champ pour indiquer la présence du conseiller à un rendez-vous', () => {
          // Given
          inputPresenceConseiller = screen.getByLabelText(
            /Informer les bénéficiaires qu’un conseiller sera présent au rendez-vous/i
          )

          // Then

          expect(inputPresenceConseiller).toBeInTheDocument()
        })

        it('contient un champ pour demander au conseiller s’il souhaite recevoir un email d’invitation au RDV', () => {
          // Given
          inputEmailInvitation = screen.getByLabelText(
            /Intégrer ce rendez-vous à mon agenda via l’adresse e-mail suivante :/i
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
            name: 'Étape 4 Informations conseiller',
          })

          // Then
          const inputCommentaires = within(etape).getByRole('textbox', {
            name: /Commentaire à destination des jeunes/,
          })
          expect(inputCommentaires).toBeInTheDocument()
          expect(inputCommentaires).not.toHaveAttribute('required')
        })
      })

      it('contient un bouton pour annuler', async () => {
        // Given
        const selectType = screen.getByRole('combobox', {
          name: 'Type',
        })

        // When
        await userEvent.selectOptions(selectType, 'Activités extérieures')

        // Then
        const cancelButton = screen.getByText('Annuler')
        expect(cancelButton).toBeInTheDocument()
      })

      describe('formulaire rempli', () => {
        let selectJeunes: HTMLInputElement
        let selectModalite: HTMLSelectElement
        let selectType: HTMLSelectElement
        let inputDate: HTMLInputElement
        let inputHoraire: HTMLInputElement
        let inputDuree: HTMLInputElement
        let inputCommentaires: HTMLTextAreaElement
        let buttonValider: HTMLButtonElement
        beforeEach(async () => {
          // Given
          selectType = screen.getByRole('combobox', {
            name: 'Type',
          })
          await userEvent.selectOptions(selectType, typesRendezVous[0].code)

          selectJeunes = screen.getByRole('combobox', {
            name: 'Rechercher et ajouter des jeunes Nom et prénom',
          })
          selectModalite = screen.getByRole('combobox', {
            name: 'Modalité',
          })
          inputDate = screen.getByLabelText('* Date (format : jj/mm/aaaa)')
          inputHoraire = screen.getByLabelText('* Heure (format : hh:mm)')
          inputDuree = screen.getByLabelText('* Durée (format : hh:mm)')
          inputCommentaires = screen.getByRole('textbox', {
            name: /Commentaire à destination des jeunes/,
          })

          buttonValider = screen.getByRole('button', {
            name: 'Créer le rendez-vous',
          })

          // Given
          await userEvent.type(selectJeunes, getNomJeuneComplet(jeunes[0]))
          await userEvent.type(selectJeunes, getNomJeuneComplet(jeunes[2]))
          await userEvent.selectOptions(selectModalite, modalites[0])
          await userEvent.type(inputDate, '2022-03-03')
          await userEvent.type(inputHoraire, '10:30')
          await userEvent.type(inputDuree, '02:37')
          await userEvent.type(inputCommentaires, 'Lorem ipsum dolor sit amet')
        })

        describe('quand le formulaire est validé', () => {
          it('crée un rendez-vous de type Generique', async () => {
            // When
            await userEvent.click(buttonValider)

            // Then
            expect(rendezVousService.postNewRendezVous).toHaveBeenCalledWith({
              jeunesIds: [jeunes[0].id, jeunes[2].id],
              type: 'ACTIVITES_EXTERIEURES',
              modality: modalites[0],
              precision: undefined,
              date: '2022-03-03T10:30:00.000+01:00',
              adresse: undefined,
              organisme: undefined,
              duration: 157,
              comment: 'Lorem ipsum dolor sit amet',
              presenceConseiller: true,
              invitation: false,
            })
          })

          it('crée un rendez-vous de type AUTRE', async () => {
            // Given
            await userEvent.selectOptions(selectType, 'AUTRE')

            const inputTypePrecision = screen.getByLabelText('* Préciser')
            await userEvent.type(inputTypePrecision, 'un texte de précision')

            // When
            await userEvent.click(buttonValider)

            // Then
            expect(rendezVousService.postNewRendezVous).toHaveBeenCalledWith({
              jeunesIds: [jeunes[0].id, jeunes[2].id],
              type: 'AUTRE',
              precision: 'un texte de précision',
              modality: modalites[0],
              date: '2022-03-03T10:30:00.000+01:00',
              adresse: undefined,
              organisme: undefined,
              duration: 157,
              comment: 'Lorem ipsum dolor sit amet',
              presenceConseiller: true,
              invitation: false,
            })
          })

          it('redirige vers la page précédente', async () => {
            // When
            await userEvent.click(buttonValider)

            // Then
            expect(push).toHaveBeenCalledWith({
              pathname: '/mes-rendezvous',
              query: { creationRdv: 'succes' },
            })
          })
        })

        it("est désactivé quand aucun jeune n'est sélectionné", async () => {
          // Given
          const enleverJeunes: HTMLButtonElement[] = screen.getAllByRole(
            'button',
            {
              name: 'Enlever jeune',
            }
          )

          // When
          for (const bouton of enleverJeunes) {
            await userEvent.click(bouton)
          }

          // Then
          expect(buttonValider).toHaveAttribute('disabled', '')
          expect(
            screen.getByText(
              "Aucun bénéficiaire n'est renseigné. Veuillez sélectionner au moins un bénéficiaire."
            )
          ).toBeInTheDocument()
        })

        it('affiche le champ de saisie pour spécifier le type Autre', async () => {
          // When
          await userEvent.selectOptions(selectType, 'AUTRE')

          // Then
          expect(screen.getByLabelText('* Préciser')).toBeInTheDocument()
        })

        it("affiche un message d'erreur quand type de rendez-vous 'Autre' pas rempli", async () => {
          // Given
          await userEvent.selectOptions(selectType, 'AUTRE')
          const inputTypePrecision: HTMLInputElement =
            screen.getByLabelText('* Préciser')

          // When
          expect(inputTypePrecision).toBeInTheDocument()
          await userEvent.click(inputTypePrecision)
          await userEvent.tab()

          // Then
          expect(inputTypePrecision.value).toEqual('')
          expect(
            screen.getByText(
              "Le champ Préciser n'est pas renseigné. Veuillez préciser le type de rendez-vous."
            )
          ).toBeInTheDocument()
        })

        it("est désactivé quand aucune date n'est sélectionnée", async () => {
          // When
          await userEvent.clear(inputDate)
          await userEvent.tab()

          // Then
          expect(buttonValider).toHaveAttribute('disabled', '')
          expect(
            screen.getByText(
              "Le champ date n'est pas valide. Veuillez respecter le format jj/mm/aaaa"
            )
          ).toBeInTheDocument()
        })

        it('est désactivé quand la date est incorrecte', async () => {
          // When
          await userEvent.type(inputDate, 'yyyy-06-06')
          await userEvent.tab()

          // Then
          expect(buttonValider).toHaveAttribute('disabled', '')
          expect(
            screen.getByText(
              "Le champ date n'est pas valide. Veuillez respecter le format jj/mm/aaaa"
            )
          ).toBeInTheDocument()
        })

        it("est désactivé quand aucune horaire n'est renseignée", async () => {
          // When
          await userEvent.clear(inputHoraire)
          await userEvent.tab()

          // Then
          expect(buttonValider).toHaveAttribute('disabled', '')
          expect(
            screen.getByText(
              "Le champ heure n'est pas renseigné. Veuillez renseigner une heure."
            )
          ).toBeInTheDocument()
        })

        it("est désactivé quand aucune durée n'est renseignée", async () => {
          // When
          await userEvent.clear(inputDuree)
          await userEvent.tab()

          // Then
          expect(buttonValider).toHaveAttribute('disabled', '')
          expect(
            screen.getByText(
              "Le champ durée n'est pas renseigné. Veuillez renseigner une durée."
            )
          ).toBeInTheDocument()
        })

        // FIXME trouver comment tester
        // it('prévient avant de revenir à la page précédente', async () => {
        //   // Given
        //   const button = screen.getByText('Quitter la création du rendez-vous')
        //
        //   // When
        //   await userEvent.click(button)
        //
        //   // Then
        //   expect(() => screen.getByText('Page précédente')).toThrow()
        //   expect(button).not.toHaveAttribute('href')
        //   expect(push).not.toHaveBeenCalled()
        //   expect(
        //     screen.getByText(
        //       'Vous allez quitter la création d’un nouveau rendez-vous'
        //     )
        //   ).toBeInTheDocument()
        // })

        it("prévient avant d'annuler", async () => {
          // Given
          const button = screen.getByText('Annuler')

          // When
          await userEvent.click(button)

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

    describe('quand on veut créer une animation collective', () => {
      describe('quand le conseiller n’a pas d’agence', () => {
        let agences: Agence[]
        let referentielService: ReferentielService
        let conseillerService: ConseillerService
        beforeEach(async () => {
          // Given
          agences = uneListeDAgencesMILO()
          referentielService = mockedReferentielService({
            getAgencesClientSide: jest.fn(async () => agences),
          })
          conseillerService = mockedConseillerService()
          renderWithContexts(
            <EditionRdv
              jeunes={jeunes}
              typesRendezVous={typesRendezVous}
              withoutChat={true}
              returnTo={'/mes-rendezvous'}
              pageTitle={''}
            />,
            {
              customDependances: {
                rendezVousService,
                referentielService,
                conseillerService,
                jeunesService,
              },
              customConseiller: { structure: StructureConseiller.MILO },
            }
          )

          // When
          await userEvent.selectOptions(
            screen.getByRole('combobox', { name: 'Type' }),
            'Atelier'
          )
        })

        it('n’affiche pas la suite du formulaire', () => {
          // Then
          expect(() => screen.getByRole('group', { name: /Étape 2/ })).toThrow()
        })

        it('demande de renseigner son agence', () => {
          // Given
          const etape1 = screen.getByRole('group', { name: /Étape 1/ })

          // Then
          expect(
            within(etape1).getByText(
              'Votre Mission locale n’est pas renseignée'
            )
          ).toBeInTheDocument()
          expect(
            within(etape1).getByRole('button', {
              name: 'Renseigner votre Mission locale',
            })
          ).toBeInTheDocument()
        })

        it('permet de renseigner son agence', async () => {
          // When
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Renseigner votre Mission locale',
            })
          )

          // Then
          expect(referentielService.getAgencesClientSide).toHaveBeenCalledWith(
            StructureConseiller.MILO
          )
          expect(
            screen.getByRole('combobox', { name: /votre Mission locale/ })
          ).toBeInTheDocument()
          agences.forEach((agence) =>
            expect(
              screen.getByRole('option', { hidden: true, name: agence.nom })
            ).toBeInTheDocument()
          )
        })

        it('sauvegarde l’agence et affiche la suite du formulaire', async () => {
          // Given
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Renseigner votre Mission locale',
            })
          )
          const agence = agences[2]
          const searchAgence = screen.getByRole('combobox', {
            name: /votre Mission locale/,
          })
          const submit = screen.getByRole('button', { name: 'Ajouter' })

          // When
          await userEvent.selectOptions(searchAgence, agence.nom)
          await userEvent.click(submit)

          // Then
          expect(conseillerService.modifierAgence).toHaveBeenCalledWith({
            id: agence.id,
            nom: agence.nom,
            codeDepartement: '3',
          })
          expect(() =>
            screen.getByText('Votre Mission locale n’est pas renseignée')
          ).toThrow()
          expect(
            screen.getByRole('group', { name: /Étape 2/ })
          ).toBeInTheDocument()
        })
      })

      it('les bénéficiaires sont facultatifs', async () => {
        // Given
        renderWithContexts(
          <EditionRdv
            jeunes={jeunes}
            typesRendezVous={typesRendezVous}
            withoutChat={true}
            returnTo={'/mes-rendezvous'}
            pageTitle={''}
          />,
          {
            customDependances: { rendezVousService, jeunesService },
            customConseiller: {
              agence: { nom: 'Mission locale Aubenas', id: 'id-etablissement' },
            },
          }
        )
        const selectType = screen.getByRole('combobox', {
          name: 'Type',
        })
        await userEvent.selectOptions(selectType, 'Atelier')

        const selectJeunes = screen.getByRole('combobox', {
          name: 'Rechercher et ajouter des jeunes Nom et prénom',
        })
        const inputDate = screen.getByLabelText('* Date (format : jj/mm/aaaa)')
        const inputHoraire = screen.getByLabelText('* Heure (format : hh:mm)')
        const inputDuree = screen.getByLabelText('* Durée (format : hh:mm)')
        await userEvent.type(inputDate, '2022-03-03')
        await userEvent.type(inputHoraire, '10:30')
        await userEvent.type(inputDuree, '02:37')

        // When
        const buttonValider = screen.getByRole('button', {
          name: 'Créer le rendez-vous',
        })
        await userEvent.click(buttonValider)

        // Then
        expect(selectJeunes).toHaveAttribute('aria-required', 'false')
        expect(rendezVousService.postNewRendezVous).toHaveBeenCalledWith(
          expect.objectContaining({
            jeunesIds: [],
          })
        )
      })
      it('récupère les bénéficiaires de l’établissement', async () => {
        // Given
        renderWithContexts(
          <EditionRdv
            jeunes={jeunes}
            typesRendezVous={typesRendezVous}
            withoutChat={true}
            returnTo={'/mes-rendezvous'}
            pageTitle={''}
          />,
          {
            customDependances: { rendezVousService, jeunesService },
            customConseiller: {
              agence: { nom: 'Mission locale Aubenas', id: 'id-etablissement' },
            },
          }
        )
        const selectType = screen.getByRole('combobox', {
          name: 'Type',
        })

        // When
        await userEvent.selectOptions(selectType, 'Atelier')

        // Then
        jeunesEtablissement.forEach((jeune) =>
          expect(
            screen.getByRole('option', {
              name: getNomJeuneComplet(jeune),
              hidden: true,
            })
          ).toBeInTheDocument()
        )
        expect(jeunesService.getJeunesDeLEtablissement).toHaveBeenCalledWith(
          'id-etablissement'
        )
      })
    })

    describe('quand un id de jeune est spécifié', () => {
      it('initialise le destinataire', async () => {
        // Given
        const idJeune = jeunes[2].id
        const jeuneFullname = getNomJeuneComplet(jeunes[2])

        // When
        renderWithContexts(
          <EditionRdv
            jeunes={jeunes}
            typesRendezVous={typesRendezVous}
            withoutChat={true}
            returnTo={'/mes-rendezvous'}
            idJeune={idJeune}
            pageTitle={''}
          />,
          { customDependances: { rendezVousService } }
        )
        const selectType = screen.getByRole('combobox', {
          name: 'Type',
        })
        await userEvent.selectOptions(selectType, 'Activités extérieures')

        // Then
        expect(() =>
          screen.getByRole('option', {
            name: jeuneFullname,
            hidden: true,
          })
        ).toThrow()
        const destinataires = screen.getByRole('region', {
          name: /Bénéficiaires/,
        })
        expect(
          within(destinataires).getByText(jeuneFullname)
        ).toBeInTheDocument()
      })
    })

    describe('quand on souhaite modifier un rdv existant', () => {
      let rdv: Rdv
      beforeEach(() => {
        // Given
        const jeune0 = {
          id: jeunes[0].id,
          prenom: jeunes[0].prenom,
          nom: jeunes[0].nom,
        }
        const jeune2 = {
          id: jeunes[2].id,
          prenom: jeunes[2].prenom,
          nom: jeunes[2].nom,
        }

        rdv = unRendezVous({ jeunes: [jeune0, jeune2] })

        // When
        renderWithContexts(
          <EditionRdv
            jeunes={jeunes}
            typesRendezVous={typesRendezVous}
            withoutChat={true}
            returnTo={'/mes-rendezvous?creationRdv=succes'}
            rdv={rdv}
            pageTitle={''}
          />,
          { customDependances: { rendezVousService } }
        )
      })

      describe('Supprimer', () => {
        beforeEach(async () => {
          // Given
          const deleteButtonFromPage = screen.getByText('Supprimer')

          // When
          await userEvent.click(deleteButtonFromPage)
        })

        it('affiche une modale avec les bonnes informations', async () => {
          // Then
          expect(
            screen.getByText(
              'L’ensemble des bénéficiaires sera notifié de la suppression'
            )
          ).toBeInTheDocument()
          expect(screen.getByText('Confirmer')).toBeInTheDocument()
        })

        it('lors de la confirmation, supprime bien le rendez-vous et retourne à la page précédente', async () => {
          // Given
          const deleteButtonFromModal = screen.getByText('Confirmer')

          // When
          await userEvent.click(deleteButtonFromModal)

          // Then
          expect(rendezVousService.deleteRendezVous).toHaveBeenCalledWith(
            rdv.id
          )
          expect(push).toHaveBeenCalledWith({
            pathname: '/mes-rendezvous',
            query: { suppressionRdv: 'succes' },
          })
        })
      })

      it('sélectionne les jeunes du rendez-vous', () => {
        const jeune0Fullname = getNomJeuneComplet(jeunes[0])
        const jeune2Fullname = getNomJeuneComplet(jeunes[2])
        expect(() =>
          screen.getByRole('option', {
            name: jeune0Fullname,
            hidden: true,
          })
        ).toThrow()
        expect(() =>
          screen.getByRole('option', {
            name: jeune2Fullname,
            hidden: true,
          })
        ).toThrow()

        const destinataires = screen.getByRole('region', {
          name: /Bénéficiaires/,
        })
        expect(
          within(destinataires).getByText(jeune0Fullname)
        ).toBeInTheDocument()
        expect(
          within(destinataires).getByText(jeune2Fullname)
        ).toBeInTheDocument()
      })

      it('initialise les autres champs avec les données du rdv', () => {
        // Then
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
        expect(screen.getByLabelText<HTMLSelectElement>(/Type/)).toBeDisabled()
        expect(
          screen.getByLabelText<HTMLSelectElement>(/Préciser/)
        ).toBeDisabled()
        expect(screen.getByLabelText<HTMLInputElement>(/agenda/)).toBeDisabled()
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
        let buttonValider: HTMLButtonElement
        beforeEach(async () => {
          // Given
          const searchJeune = screen.getByRole('combobox', {
            name: /ajouter des jeunes/,
          })
          const beneficiaires = screen.getByRole('region', {
            name: /Bénéficiaires/,
          })
          const jeuneSelectionne = within(beneficiaires).getByText(
            getNomJeuneComplet(jeunes[2])
          )
          const enleverJeune = within(jeuneSelectionne).getByRole('button', {
            name: /Enlever/,
          })

          const selectModalite = screen.getByRole('combobox', {
            name: 'Modalité',
          })
          const inputDate = screen.getByLabelText(
            '* Date (format : jj/mm/aaaa)'
          )
          const inputHoraire = screen.getByLabelText('* Heure (format : hh:mm)')
          const inputDuree = screen.getByLabelText('* Durée (format : hh:mm)')
          const inputCommentaires = screen.getByRole('textbox', {
            name: /Commentaire à destination des jeunes/,
          })

          buttonValider = screen.getByRole('button', {
            name: 'Modifier le rendez-vous',
          })

          // Given
          await userEvent.type(searchJeune, getNomJeuneComplet(jeunes[1]))
          await userEvent.click(enleverJeune)
          await userEvent.selectOptions(selectModalite, modalites[0])

          await userEvent.clear(inputDate)
          await userEvent.type(inputDate, '2022-03-03')
          await userEvent.clear(inputHoraire)
          await userEvent.type(inputHoraire, '10:30')
          await userEvent.clear(inputDuree)
          await userEvent.type(inputDuree, '02:37')
          await userEvent.clear(inputCommentaires)
          await userEvent.type(inputCommentaires, 'Lorem ipsum dolor sit amet')
        })

        // FIXME trouver comment tester
        // it('prévient avant de revenir à la page précédente', async () => {
        //   // Given
        //   const button = screen.getByText(
        //     'Quitter la modification du rendez-vous'
        //   )
        //
        //   // When
        //   await userEvent.click(button)
        //
        //   // Then
        //   expect(() => screen.getByText('Page précédente')).toThrow()
        //   expect(button).not.toHaveAttribute('href')
        //   expect(push).not.toHaveBeenCalled()
        //   expect(
        //     screen.getByText(
        //       'Vous allez quitter la modification du rendez-vous'
        //     )
        //   ).toBeInTheDocument()
        // })

        it("prévient avant d'annuler", async () => {
          // Given
          const button = screen.getByText('Annuler')

          // When
          await userEvent.click(button)

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
            await userEvent.click(buttonValider)

            // Then
            expect(rendezVousService.updateRendezVous).toHaveBeenCalledWith(
              rdv.id,
              {
                jeunesIds: [jeunes[0].id, jeunes[1].id],
                type: 'AUTRE',
                modality: modalites[0],
                precision: 'Prise de nouvelles',
                date: '2022-03-03T10:30:00.000+01:00',
                adresse: '36 rue de marseille, 93200 Saint-Denis',
                organisme: 'S.A.R.L',
                duration: 157,
                comment: 'Lorem ipsum dolor sit amet',
                presenceConseiller: false,
                invitation: true,
              }
            )
          })

          it('redirige vers la page précédente', async () => {
            // When
            await userEvent.click(buttonValider)

            // Then
            expect(push).toHaveBeenCalledWith({
              pathname: '/mes-rendezvous',
              query: { modificationRdv: 'succes' },
            })
          })
        })
      })
    })

    describe('quand le conseiller connecté n’est pas le même que celui qui à crée le rdv', () => {
      let rdv: Rdv
      beforeEach(() => {
        // Given
        const jeune = {
          id: jeunes[0].id,
          prenom: jeunes[0].prenom,
          nom: jeunes[0].nom,
        }
        const jeuneAutreConseiller = {
          id: 'jeune-autre-conseiller',
          prenom: 'Michel',
          nom: 'Dupont',
        }

        rdv = unRendezVous({
          jeunes: [jeune, jeuneAutreConseiller],
          createur: { id: '2', nom: 'Hermet', prenom: 'Gaëlle' },
        })

        // When
        renderWithContexts(
          <EditionRdv
            jeunes={jeunes}
            typesRendezVous={typesRendezVous}
            withoutChat={true}
            returnTo={'/mes-rendezvous?creationRdv=succes'}
            rdv={rdv}
            pageTitle={''}
          />,
          { customDependances: { rendezVousService } }
        )
      })

      it("contient un message pour prévenir qu'il y a des jeunes qui ne sont pas au conseiller", () => {
        // Then
        expect(
          screen.getByText(/des jeunes que vous ne suivez pas/)
        ).toBeInTheDocument()
      })

      it('contient tous les jeunes, y compris ceux qui ne sont pas aux conseiller connecté', () => {
        // Given
        const beneficiaires = screen.getByRole('region', {
          name: /Bénéficiaires/,
        })

        // Then
        const jeune = within(beneficiaires).getByText(
          getNomJeuneComplet(jeunes[0])
        )
        expect(() =>
          within(jeune).getByLabelText(
            /Ce jeune n'est pas dans votre portefeuille/
          )
        ).toThrow()
        expect(() =>
          screen.getByRole('option', {
            name: getNomJeuneComplet(jeunes[0]),
            hidden: true,
          })
        ).toThrow()

        const autreJeune = within(beneficiaires).getByText('Dupont Michel')
        expect(
          within(autreJeune).getByLabelText(
            /Ce jeune n'est pas dans votre portefeuille/
          )
        ).toBeInTheDocument()
        expect(() =>
          screen.getByRole('option', {
            name: 'Dupont Michel',
            hidden: true,
          })
        ).toThrow()
      })

      it('contient un champ pour demander si le créateur recevra un email d’invitation au RDV', () => {
        // Then
        expect(
          screen.getByLabelText(
            /Le créateur du rendez-vous recevra un mail pour l'informer de la modification./i
          )
        ).toBeInTheDocument()
      })

      it("contient un message pour prévenir le conseiller qu'il ne recevra pas d'invitation", () => {
        // Then
        expect(
          screen.getByText(
            "Le rendez-vous a été créé par un autre conseiller : Gaëlle Hermet. Vous ne recevrez pas d'invitation dans votre agenda"
          )
        ).toBeInTheDocument()
      })

      it("contient un message spécial lors de la suppression pour prévenir qu'il y a des jeunes qui ne sont pas au conseiller", async () => {
        // When
        const deleteButtonFromPage = screen.getByText('Supprimer')
        await userEvent.click(deleteButtonFromPage)

        // Then
        expect(
          screen.getByText(
            /concerne des jeunes qui ne sont pas dans votre portefeuille/
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText(/Le créateur recevra un email de suppression/)
        ).toBeInTheDocument()
      })

      describe('quand on modifie le rendez-vous', () => {
        beforeEach(async () => {
          const inputCommentaire =
            screen.getByLabelText<HTMLInputElement>(/Commentaire/)
          await userEvent.clear(inputCommentaire)
          await userEvent.type(inputCommentaire, 'modification du commentaire')
          const buttonSubmit = screen.getByText('Modifier le rendez-vous')

          // When
          await userEvent.click(buttonSubmit)
        })

        it('affiche une modal de verification', () => {
          // Then
          expect(
            screen.getByText(
              'Vous avez modifié un rendez-vous dont vous n’êtes pas le créateur'
            )
          ).toBeInTheDocument()
          expect(rendezVousService.updateRendezVous).not.toHaveBeenCalled()
        })

        it('modifie le rendez-vous après la modale', async () => {
          // Given
          const boutonConfirmer = screen.getByRole('button', {
            name: 'Confirmer',
          })

          // When
          await userEvent.click(boutonConfirmer)

          // Then
          expect(rendezVousService.updateRendezVous).toHaveBeenCalledWith(
            rdv.id,
            {
              jeunesIds: [jeunes[0].id, 'jeune-autre-conseiller'],
              type: 'AUTRE',
              modality: modalites[2],
              precision: 'Prise de nouvelles',
              date: '2021-10-21T12:00:00.000+02:00',
              adresse: '36 rue de marseille, 93200 Saint-Denis',
              organisme: 'S.A.R.L',
              duration: 125,
              comment: 'modification du commentaire',
              presenceConseiller: false,
              invitation: true,
            }
          )
        })
      })
    })
  })
})
