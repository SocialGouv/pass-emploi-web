import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'

import EditionRdvPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/edition-rdv/EditionRdvPage'
import {
  typesAnimationCollective,
  typesEvenement,
  typesEvenementCEJ,
  unEvenement,
} from 'fixtures/evenement'
import { desItemsJeunes, uneBaseJeune } from 'fixtures/jeune'
import { StructureConseiller } from 'interfaces/conseiller'
import { Evenement, StatutAnimationCollective } from 'interfaces/evenement'
import { BaseJeune, getNomJeuneComplet, JeuneFromListe } from 'interfaces/jeune'
import { TypeEvenementReferentiel } from 'interfaces/referentiel'
import { AlerteParam } from 'referentiel/alerteParam'
import { modalites } from 'referentiel/evenement'
import {
  creerEvenement,
  supprimerEvenement,
  updateRendezVous,
} from 'services/evenements.service'
import { getJeunesDeLEtablissementClientSide } from 'services/jeunes.service'
import getByDescriptionTerm, { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/evenements.service')
jest.mock('services/jeunes.service')
jest.mock('components/Modal')
jest.mock('components/PageActionsPortal')

describe('EditionRdvPage client side', () => {
  describe('Rendez-vous', () => {
    let jeunesConseiller: JeuneFromListe[]
    let jeunesAutreConseiller: BaseJeune[]
    let jeunesEtablissement: BaseJeune[]
    let typesRendezVous: TypeEvenementReferentiel[]

    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
    let push: Function
    let refresh: jest.Mock

    beforeEach(() => {
      jeunesConseiller = desItemsJeunes()
      jeunesAutreConseiller = [
        uneBaseJeune({
          id: 'jeune-etablissement-1',
          prenom: 'Jeune Etablissement 1',
        }),
        uneBaseJeune({
          id: 'jeune-etablissement-2',
          prenom: 'Jeune Etablissement 2',
        }),
      ]
      jeunesEtablissement = [
        ...jeunesConseiller.map(({ id, nom, prenom }) => ({ id, nom, prenom })),
        ...jeunesAutreConseiller,
      ]
      ;(supprimerEvenement as jest.Mock).mockResolvedValue(undefined)
      ;(creerEvenement as jest.Mock).mockResolvedValue(
        '963afb47-2b15-46a9-8c0c-0e95240b2eb5'
      )
      ;(getJeunesDeLEtablissementClientSide as jest.Mock).mockResolvedValue(
        jeunesEtablissement
      )
      typesRendezVous = typesEvenement()

      alerteSetter = jest.fn()
      push = jest.fn(() => Promise.resolve())
      refresh = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ push, refresh })
    })

    describe('contenu', () => {
      beforeEach(() => {
        // When
        renderWithContexts(
          <EditionRdvPage
            typesRendezVous={typesRendezVous}
            returnTo='/agenda?onglet=conseiller'
            lectureSeule={false}
            conseillerEstObservateur={false}
          />,
          {
            customConseiller: { email: 'fake@email.com' },
            customAlerte: { alerteSetter },
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

      describe('étape 1 type de rendez-vous', () => {
        let etape: HTMLFieldSetElement
        let selectType: HTMLSelectElement

        beforeEach(() => {
          etape = screen.getByRole('group', {
            name: 'Étape 1: Sélectionnez un rendez-vous',
          })
          selectType = within(etape).getByRole('combobox', {
            name: /Type/,
          })
          typesRendezVous = typesEvenementCEJ()
        })

        it('contient une liste pour choisir un type', () => {
          // Then
          expect(selectType).toBeInTheDocument()
          expect(selectType).toHaveAttribute('required', '')
          for (const typeRendezVous of typesRendezVous) {
            expect(
              within(etape).getByRole('option', {
                name: typeRendezVous.label,
              })
            ).toBeInTheDocument()
          }
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
              /Informer les bénéficiaires qu’un conseiller sera présent à l’événement/i
            )

            expect(inputPresenceConseiller).toBeDisabled()
          })
        })
      })

      describe('étape 2 description', () => {
        let etape: HTMLFieldSetElement

        beforeEach(async () => {
          const selectType = screen.getByRole('combobox', {
            name: /Type/,
          })
          await userEvent.selectOptions(selectType, 'Activités extérieures')
          etape = screen.getByRole('group', {
            name: 'Étape 2: Décrivez le rendez-vous',
          })
        })

        it('contient un champ pour renseigner un titre', () => {
          // Then
          expect(
            within(etape).getByRole('textbox', { name: 'Titre' })
          ).toHaveProperty('required', false)
        })

        it('contient un champ pour saisir une description', () => {
          // Then
          const inputDescription = within(etape).getByRole('textbox', {
            name: /Commentaire/,
          })
          expect(inputDescription).toBeInTheDocument()
          expect(inputDescription).not.toHaveAttribute('required')
        })
      })

      describe('étape 3 bénéficiaires', () => {
        let etape: HTMLFieldSetElement

        beforeEach(async () => {
          const selectType = screen.getByRole('combobox', {
            name: /Type/,
          })
          await userEvent.selectOptions(selectType, 'Activités extérieures')
          etape = screen.getByRole('group', {
            name: 'Étape 3: Ajoutez des bénéficiaires',
          })
        })

        it('contient une liste pour choisir un jeune', () => {
          // Then
          const selectJeune = within(etape).getByRole('combobox', {
            name: /Bénéficiaires/,
          })
          const options = within(etape).getByRole('listbox', { hidden: true })

          expect(selectJeune).toHaveAttribute('aria-required', 'true')
          expect(selectJeune).toHaveAttribute('multiple', '')
          for (const jeune of jeunesConseiller) {
            const jeuneOption = within(options).getByRole('option', {
              name: `${jeune.nom} ${jeune.prenom}`,
              hidden: true,
            })
            expect(jeuneOption).toBeInTheDocument()
          }
        })

        it('ne contient pas de message indiquant le caractère facultatif d’ajout de bénéficiaires', () => {
          expect(() =>
            screen.getByText(
              'Pour les informations collectives, l’ajout de bénéficiaires est facultatif'
            )
          ).toThrow()
        })

        it('ne permet pas de renseigner un nombre maximum de participants', () => {
          // Then
          expect(
            screen.queryByRole('spinbutton', {
              name: 'Définir un nombre maximum de participants',
            })
          ).not.toBeInTheDocument()
        })
      })

      describe('étape 4 lieu et date', () => {
        let etape: HTMLFieldSetElement
        beforeEach(async () => {
          const selectType = screen.getByRole('combobox', {
            name: /Type/,
          })
          await userEvent.selectOptions(selectType, 'Activités extérieures')
          etape = screen.getByRole('group', {
            name: 'Étape 4: Ajoutez les modalités pratiques',
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

        it('contient un champ pour choisir la date', () => {
          // Then
          const inputDate = within(etape).getByLabelText(
            '* Date format : jj/mm/aaaa'
          )
          expect(inputDate).toBeInTheDocument()
          expect(inputDate).toHaveAttribute('required', '')
          expect(inputDate).toHaveAttribute('type', 'date')
        })

        it("contient un champ pour choisir l'horaire", () => {
          // Then
          const inputHoraire = within(etape).getByLabelText(
            '* Heure format : hh:mm'
          )
          expect(inputHoraire).toBeInTheDocument()
          expect(inputHoraire).toHaveAttribute('required', '')
          expect(inputHoraire).toHaveAttribute('type', 'time')
        })

        it('contient un champ pour choisir la durée', () => {
          // Then
          const inputDuree = within(etape).getByLabelText(
            '* Durée format : hh:mm'
          )
          expect(inputDuree).toBeInTheDocument()
          expect(inputDuree).toHaveAttribute('required', '')
          expect(inputDuree).toHaveAttribute('type', 'time')
        })

        it('contient un champ pour indiquer l’adresse si besoin', () => {
          // Then
          const inputAdresse = within(etape).getByLabelText(
            'Adresse exemple : 12 rue Duc, Brest'
          )
          expect(inputAdresse).toBeInTheDocument()
          expect(inputAdresse).toHaveAttribute('type', 'text')
        })

        it('contient un champ pour indiquer un organisme si besoin', () => {
          // Then
          const inputOrganisme = within(etape).getByLabelText(
            'Organisme exemple : prestataire, entreprise, etc.'
          )
          expect(inputOrganisme).toBeInTheDocument()
          expect(inputOrganisme).toHaveAttribute('type', 'text')
        })
      })

      describe('étape 5 gestion accès', () => {
        let etape: HTMLFieldSetElement
        let inputPresenceConseiller: HTMLInputElement
        let inputEmailInvitation: HTMLInputElement
        beforeEach(async () => {
          const selectType = screen.getByRole('combobox', {
            name: /Type/,
          })
          await userEvent.selectOptions(selectType, 'Activités extérieures')
          etape = screen.getByRole('group', {
            name: 'Étape 5: Définissez la gestion des accès',
          })
        })
        it('contient un champ pour indiquer la présence du conseiller à un rendez-vous', () => {
          // Given
          inputPresenceConseiller = screen.getByLabelText(
            /Informer les bénéficiaires qu’un conseiller sera présent à l’événement/i
          )

          // Then

          expect(inputPresenceConseiller).toBeInTheDocument()
        })

        it('contient un champ pour demander au conseiller s’il souhaite recevoir un email d’invitation à l’événement', () => {
          // Given
          inputEmailInvitation = screen.getByLabelText(
            /Intégrer cet événement à mon agenda via l’adresse e-mail suivante :/i
          )

          // Then

          expect(inputEmailInvitation).toBeInTheDocument()
        })

        it('indique l’email auquel le conseiller va recevoir son invitation à l’événement', () => {
          // Given

          let getEmailConseiller: HTMLInputElement =
            screen.getByLabelText(/fake@email.com/i)

          // Then

          expect(getEmailConseiller).toBeInTheDocument()
        })
      })

      it('contient un bouton pour annuler', async () => {
        // Given
        const selectType = screen.getByRole('combobox', {
          name: /Type/,
        })

        // When
        await userEvent.selectOptions(selectType, 'Activités extérieures')

        // Then
        const cancelButton = screen.getByText('Annuler')
        expect(cancelButton).toBeInTheDocument()
      })

      describe('quand tous les champs ne sont pas remplis', () => {
        let selectJeunes: HTMLInputElement
        let selectModalite: HTMLSelectElement
        let selectType: HTMLSelectElement
        let inputDate: HTMLInputElement
        let inputHoraire: HTMLInputElement
        let inputDuree: HTMLInputElement
        let inputTitre: HTMLInputElement
        let inputDescription: HTMLTextAreaElement
        let buttonValider: HTMLButtonElement
        beforeEach(async () => {
          // Given
          selectType = screen.getByRole('combobox', {
            name: /Type/,
          })
          selectJeunes = screen.getByRole('combobox', {
            name: /Bénéficiaires/,
          })
          selectModalite = screen.getByRole('combobox', {
            name: 'Modalité',
          })
          inputDate = screen.getByLabelText('* Date format : jj/mm/aaaa')
          inputHoraire = screen.getByLabelText('* Heure format : hh:mm')
          inputDuree = screen.getByLabelText('* Durée format : hh:mm')
          inputTitre = screen.getByRole('textbox', { name: 'Titre' })
          inputDescription = screen.getByRole('textbox', {
            name: /Commentaire/,
          })

          buttonValider = screen.getByRole('button', {
            name: 'Créer le rendez-vous',
          })
        })

        it('ne soumet pas l’évènement quand aucun type n’est renseigné', async () => {
          //When
          await userEvent.click(buttonValider)

          //Then
          expect(creerEvenement).not.toHaveBeenCalled()
          expect(
            screen.getByText(/Le champ ”Type” est vide./)
          ).toBeInTheDocument()
        })

        it('ne soumet pas l’évènement quand le champ Préciser n’est pas renseigné pour le type Autre', async () => {
          //When
          await userEvent.selectOptions(selectType, 'AUTRE')

          await userEvent.click(buttonValider)

          //Then
          expect(creerEvenement).not.toHaveBeenCalled()
          expect(
            screen.getByText(/Le champ ”Préciser” est vide./)
          ).toBeInTheDocument()
        })

        it('ne soumet pas l’évènement quand aucun bénéficiaire n’est renseigné', async () => {
          //Given
          await userEvent.selectOptions(selectType, typesRendezVous[0].code)
          await userEvent.type(inputTitre, 'Titre de l’événement')
          await userEvent.type(inputDescription, 'Lorem ipsum dolor sit amet')

          //When
          await userEvent.click(buttonValider)

          //Then
          expect(creerEvenement).not.toHaveBeenCalled()
          expect(screen.getByText(/Aucun bénéficiaire/)).toBeInTheDocument()
        })

        it('ne soumet pas l’évènement quand aucune date n’est renseignée', async () => {
          //Given
          await userEvent.selectOptions(selectType, typesRendezVous[0].code)
          await userEvent.type(inputTitre, 'Titre de l’événement')
          await userEvent.type(inputDescription, 'Lorem ipsum dolor sit amet')
          await userEvent.type(
            selectJeunes,
            getNomJeuneComplet(jeunesConseiller[0])
          )

          //When
          await userEvent.click(buttonValider)

          //Then
          expect(creerEvenement).not.toHaveBeenCalled()
          expect(
            screen.getByText(/Le champ “Date“ est vide./)
          ).toBeInTheDocument()
        })

        it('ne soumet pas l’évènement quand aucun horaire n’est renseigné', async () => {
          //Given
          await userEvent.selectOptions(selectType, typesRendezVous[0].code)
          await userEvent.type(inputTitre, 'Titre de l’événement')
          await userEvent.type(inputDescription, 'Lorem ipsum dolor sit amet')
          await userEvent.type(
            selectJeunes,
            getNomJeuneComplet(jeunesConseiller[0])
          )
          await userEvent.type(inputDate, '2022-03-03')

          //When
          await userEvent.click(buttonValider)

          //Then
          expect(creerEvenement).not.toHaveBeenCalled()
          expect(
            screen.getByText(/Le champ “Horaire“ est vide./)
          ).toBeInTheDocument()
        })

        it('ne soumet pas l’évènement quand aucune durée n’est renseignée', async () => {
          //Given
          await userEvent.selectOptions(selectType, typesRendezVous[0].code)
          await userEvent.type(inputTitre, 'Titre de l’événement')
          await userEvent.type(inputDescription, 'Lorem ipsum dolor sit amet')
          await userEvent.type(
            selectJeunes,
            getNomJeuneComplet(jeunesConseiller[0])
          )
          await userEvent.type(inputDate, '2022-03-03')
          await userEvent.type(inputHoraire, '02:37')

          //When
          await userEvent.click(buttonValider)

          //Then
          expect(creerEvenement).not.toHaveBeenCalled()
          expect(
            screen.getByText(/Le champ “Durée“ est vide./)
          ).toBeInTheDocument()
        })
      })

      describe('formulaire rempli', () => {
        let selectJeunes: HTMLInputElement
        let selectModalite: HTMLSelectElement
        let selectType: HTMLSelectElement
        let inputDate: HTMLInputElement
        let inputHoraire: HTMLInputElement
        let inputDuree: HTMLInputElement
        let inputTitre: HTMLInputElement
        let inputDescription: HTMLTextAreaElement
        let buttonValider: HTMLButtonElement
        beforeEach(async () => {
          // Given
          selectType = screen.getByRole('combobox', {
            name: /Type/,
          })
          await userEvent.selectOptions(selectType, typesRendezVous[0].code)

          selectJeunes = screen.getByRole('combobox', {
            name: /Bénéficiaires/,
          })
          selectModalite = screen.getByRole('combobox', {
            name: 'Modalité',
          })
          inputDate = screen.getByLabelText('* Date format : jj/mm/aaaa')
          inputHoraire = screen.getByLabelText('* Heure format : hh:mm')
          inputDuree = screen.getByLabelText('* Durée format : hh:mm')
          inputTitre = screen.getByRole('textbox', { name: 'Titre' })
          inputDescription = screen.getByRole('textbox', {
            name: /Commentaire/,
          })

          buttonValider = screen.getByRole('button', {
            name: 'Créer le rendez-vous',
          })

          // Given
          await userEvent.type(
            selectJeunes,
            getNomJeuneComplet(jeunesConseiller[0])
          )
          await userEvent.type(
            selectJeunes,
            getNomJeuneComplet(jeunesConseiller[2])
          )
          await userEvent.selectOptions(selectModalite, modalites[0])
          await userEvent.type(inputDate, '2022-03-03')
          await userEvent.type(inputHoraire, '10:30')
          await userEvent.type(inputDuree, '02:37')
          await userEvent.type(inputTitre, 'Titre de l’événement')
          await userEvent.type(inputDescription, 'Lorem ipsum dolor sit amet')
        })

        describe('quand le formulaire est validé', () => {
          it('crée un rendez-vous de type Generique', async () => {
            // When
            await userEvent.click(buttonValider)

            // Then
            expect(creerEvenement).toHaveBeenCalledWith({
              jeunesIds: [jeunesConseiller[2].id, jeunesConseiller[0].id],
              titre: 'Titre de l’événement',
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
            expect(creerEvenement).toHaveBeenCalledWith({
              jeunesIds: [jeunesConseiller[2].id, jeunesConseiller[0].id],
              titre: 'Titre de l’événement',
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
            expect(alerteSetter).toHaveBeenCalledWith(
              'creationRDV',
              '963afb47-2b15-46a9-8c0c-0e95240b2eb5'
            )
            expect(push).toHaveBeenCalledWith('/agenda?onglet=conseiller')
          })
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
              'Le champ “Préciser” est vide. Précisez le type de rendez-vous.'
            )
          ).toBeInTheDocument()
        })

        it('affiche une erreur quand la description dépasse 250 caractères', async () => {
          // When
          await userEvent.clear(inputDescription)
          await userEvent.type(
            inputDescription,
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' +
              'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' +
              'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
          )
          await userEvent.tab()

          // Then
          expect(
            screen.getByText(
              'Vous avez dépassé le nombre maximal de caractères. Retirez des caractères.'
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
              'Souhaitez-vous quitter la création de l’événement ?'
            )
          ).toBeInTheDocument()
        })
      })
    })

    describe('événements issus d’i-milo', () => {
      beforeEach(() => {
        // Given
        const evenement = unEvenement({ source: StructureConseiller.MILO })

        // When
        renderWithContexts(
          <EditionRdvPage
            typesRendezVous={typesRendezVous}
            returnTo='https://localhost:3000/agenda'
            evenement={evenement}
            lectureSeule={true}
            conseillerEstObservateur={true}
          />
        )
      })

      it('affiche encart explicatif d’un événement provenant du système d’information MILO', () => {
        //Then
        expect(
          screen.getByText(
            /Pour modifier cet événement vous devez vous rendre dans le système d’information iMilo, il sera ensuite mis à jour dans la demi-heure/
          )
        ).toBeInTheDocument()
      })

      it('affiche l’information de création d’événement provenant du système d’information MILO', () => {
        //Then
        expect(
          screen.getByText('Système d’information MILO')
        ).toBeInTheDocument()
      })

      it('empêche toute modification', () => {
        // Then
        expect(screen.getByLabelText(/Titre/)).toBeDisabled()
        expect(screen.getByLabelText(/Commentaire/)).toBeDisabled()
        expect(screen.getByLabelText('Modalité')).toBeDisabled()
        expect(screen.getByLabelText(/Date/)).toBeDisabled()
        expect(screen.getByLabelText(/Heure/)).toBeDisabled()
        expect(screen.getByLabelText(/Durée/)).toBeDisabled()
        expect(screen.getByLabelText(/Adresse/)).toBeDisabled()
        expect(screen.getByLabelText(/Organisme/)).toBeDisabled()
        expect(screen.getByLabelText(/conseiller sera présent/)).toBeDisabled()
        expect(
          screen.getByLabelText(
            /Recherchez et ajoutez un ou plusieurs bénéficiaires/
          )
        ).toBeDisabled()
        expect(
          screen.queryByRole('button', { name: /Enlever jeune/ })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /Supprimer/ })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /Annuler/ })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /Modifier/ })
        ).not.toBeInTheDocument()
      })
    })

    describe('quand un id de jeune est spécifié', () => {
      it('initialise le destinataire', async () => {
        // Given
        const idJeune = jeunesConseiller[2].id
        const jeuneFullname = getNomJeuneComplet(jeunesConseiller[2])

        // When
        renderWithContexts(
          <EditionRdvPage
            typesRendezVous={typesRendezVous}
            returnTo='/agenda'
            idJeune={idJeune}
            lectureSeule={false}
            conseillerEstObservateur={false}
          />
        )
        const selectType = screen.getByRole('combobox', {
          name: /Type/,
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

    describe('quand on souhaite modifier un rendez-vous existant', () => {
      let evenement: Evenement
      beforeEach(() => {
        // Given
        const jeune0 = {
          id: jeunesConseiller[0].id,
          prenom: jeunesConseiller[0].prenom,
          nom: jeunesConseiller[0].nom,
        }
        const jeune2 = {
          id: jeunesConseiller[2].id,
          prenom: jeunesConseiller[2].prenom,
          nom: jeunesConseiller[2].nom,
        }

        evenement = unEvenement({ jeunes: [jeune0, jeune2] })

        // When
        renderWithContexts(
          <EditionRdvPage
            typesRendezVous={typesRendezVous}
            returnTo='/agenda'
            evenement={evenement}
            lectureSeule={false}
            conseillerEstObservateur={false}
          />,
          {
            customAlerte: { alerteSetter },
          }
        )
      })

      it('affiche le créateur de l’événement', () => {
        // Then
        expect(getByDescriptionTerm('Type de l’événement')).toHaveTextContent(
          'Autre'
        )
        expect(getByDescriptionTerm('Créé(e) par : ')).toHaveTextContent(
          'Nils Tavernier'
        )
      })

      it('affiche l’historique de modification de l’événement', async () => {
        // Then
        const historique = getByDescriptionTerm('Historique des modifications')
        expect(within(historique).getAllByRole('listitem').length).toEqual(2)
        evenement.historique.slice(0, 2).forEach(({ date, auteur }) => {
          expect(
            getByTextContent(
              `${DateTime.fromISO(date).toFormat("dd/MM/yyyy 'à' HH'h'mm")} : ${
                auteur.prenom
              } ${auteur.nom}`,
              historique
            )
          ).toBeInTheDocument()
        })

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Voir plus' }))
        // Then
        expect(within(historique).getAllByRole('listitem').length).toEqual(
          evenement.historique.length
        )
        await userEvent.click(
          screen.getByRole('button', { name: 'Voir moins' })
        )
        expect(within(historique).getAllByRole('listitem').length).toEqual(2)
      })

      it('sélectionne les jeunes du rendez-vous', () => {
        const jeune0Fullname = getNomJeuneComplet(jeunesConseiller[0])
        const jeune2Fullname = getNomJeuneComplet(jeunesConseiller[2])
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

      it('initialise les autres champs avec les données de l’evenement', () => {
        // Then
        expect(screen.getByLabelText<HTMLSelectElement>(/Type/).value).toEqual(
          evenement.type.code
        )
        expect(
          screen.getByLabelText<HTMLSelectElement>(/Préciser/).value
        ).toEqual(evenement.precisionType)
        expect(
          screen.getByLabelText<HTMLSelectElement>(/Modalité/).value
        ).toEqual(evenement.modality)
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
        expect(screen.getByLabelText<HTMLInputElement>('Titre')).toHaveValue(
          'Prise de nouvelles par téléphone'
        )
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
        const link = screen.getByText('Annuler la modification')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/agenda')
      })

      describe('rendez-vous modifié', () => {
        let buttonValider: HTMLButtonElement
        beforeEach(async () => {
          // Given
          const searchJeune = screen.getByRole('combobox', {
            name: /Recherchez et ajoutez un ou plusieurs bénéficiaires/,
          })
          const beneficiaires = screen.getByRole('region', {
            name: /Bénéficiaires/,
          })
          const jeuneSelectionne = within(beneficiaires).getByText(
            getNomJeuneComplet(jeunesConseiller[2])
          )
          const enleverJeune = within(jeuneSelectionne).getByRole('button', {
            name: /Enlever/,
          })

          const selectModalite = screen.getByRole('combobox', {
            name: 'Modalité',
          })
          const inputDate = screen.getByLabelText('* Date format : jj/mm/aaaa')
          const inputHoraire = screen.getByLabelText('* Heure format : hh:mm')
          const inputDuree = screen.getByLabelText('* Durée format : hh:mm')
          const inputTitre = screen.getByRole('textbox', {
            name: 'Titre',
          })
          const inputDescription = screen.getByRole('textbox', {
            name: /Commentaire/,
          })

          buttonValider = screen.getByRole('button', {
            name: 'Modifier le rendez-vous',
          })

          // Given
          await userEvent.type(
            searchJeune,
            getNomJeuneComplet(jeunesConseiller[1])
          )
          await userEvent.click(enleverJeune)
          await userEvent.selectOptions(selectModalite, modalites[0])

          await userEvent.clear(inputDate)
          await userEvent.type(inputDate, '2022-03-03')
          await userEvent.clear(inputHoraire)
          await userEvent.type(inputHoraire, '10:30')
          await userEvent.clear(inputDuree)
          await userEvent.type(inputDuree, '02:37')
          await userEvent.clear(inputTitre)
          await userEvent.type(inputTitre, 'Nouveau titre')
          await userEvent.clear(inputDescription)
          await userEvent.type(inputDescription, 'Lorem ipsum dolor sit amet')
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
          const button = screen.getByText('Annuler la modification')

          // When
          await userEvent.click(button)

          // Then
          expect(button).not.toHaveAttribute('href')
          expect(push).not.toHaveBeenCalled()
          expect(
            screen.getByText('Les informations saisies seront perdues.')
          ).toBeInTheDocument()
        })

        describe('quand le formulaire est validé', () => {
          it('modifie le rendez-vous', async () => {
            // When
            await userEvent.click(buttonValider)

            // Then
            expect(updateRendezVous).toHaveBeenCalledWith(evenement.id, {
              jeunesIds: [jeunesConseiller[1].id, jeunesConseiller[0].id],
              titre: 'Nouveau titre',
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
            })
          })

          it('redirige vers la page précédente', async () => {
            // When
            await userEvent.click(buttonValider)

            // Then
            expect(alerteSetter).toHaveBeenCalledWith('modificationRDV')
            expect(push).toHaveBeenCalledWith('/agenda')
          })
        })
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
              'Les bénéficiaires seront notifiées de la suppression.'
            )
          ).toBeInTheDocument()
          expect(screen.getByText('Supprimer l’événement')).toBeInTheDocument()
        })

        it('lors de la confirmation, supprime bien le rendez-vous et retourne à la page précédente', async () => {
          // Given
          const deleteButtonFromModal = screen.getByText(
            'Supprimer l’événement'
          )

          // When
          await userEvent.click(deleteButtonFromModal)

          // Then
          expect(supprimerEvenement).toHaveBeenCalledWith(evenement.id)
          expect(alerteSetter).toHaveBeenCalledWith('suppressionRDV')
          expect(push).toHaveBeenCalledWith('/agenda')
        })
      })
    })

    describe('quand le conseiller connecté n’est pas le même que celui qui à crée l’événement', () => {
      let evenement: Evenement
      beforeEach(() => {
        // Given
        const jeune = {
          id: jeunesConseiller[0].id,
          prenom: jeunesConseiller[0].prenom,
          nom: jeunesConseiller[0].nom,
        }
        const jeuneAutreConseiller = {
          id: 'jeune-autre-conseiller',
          prenom: 'Michel',
          nom: 'Dupont',
        }

        evenement = unEvenement({
          jeunes: [jeune, jeuneAutreConseiller],
          createur: { id: '2', nom: 'Hermet', prenom: 'Gaëlle' },
        })

        // When
        renderWithContexts(
          <EditionRdvPage
            typesRendezVous={typesRendezVous}
            returnTo='/agenda'
            evenement={evenement}
            conseillerEstObservateur={false}
            lectureSeule={false}
          />
        )
      })

      it("contient un message pour prévenir qu'il y a des jeunes qui ne sont pas au conseiller", () => {
        // Then
        expect(
          screen.getByText(/des bénéficiaires que vous ne suivez pas/)
        ).toBeInTheDocument()
      })

      it('contient tous les jeunes, y compris ceux qui ne sont pas aux conseiller connecté', () => {
        // Given
        const beneficiaires = screen.getByRole('region', {
          name: /Bénéficiaires/,
        })

        // Then
        const jeune = within(beneficiaires).getByText(
          getNomJeuneComplet(jeunesConseiller[0])
        )
        expect(() =>
          within(jeune).getByLabelText(
            /Ce bénéficiaire n’est pas dans votre portefeuille/
          )
        ).toThrow()
        expect(() =>
          screen.getByRole('option', {
            name: getNomJeuneComplet(jeunesConseiller[0]),
            hidden: true,
          })
        ).toThrow()

        const autreJeune = within(beneficiaires).getByText('Dupont Michel')
        expect(
          within(autreJeune).getByLabelText(
            /Ce bénéficiaire n’est pas dans votre portefeuille/
          )
        ).toBeInTheDocument()
        expect(() =>
          screen.getByRole('option', {
            name: 'Dupont Michel',
            hidden: true,
          })
        ).toThrow()
      })

      it('contient un champ pour demander si le créateur recevra un email d’invitation à l’événement', () => {
        // Then
        expect(
          screen.getByLabelText(
            /Le créateur de l’événement recevra un mail pour l'informer de la modification./i
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
            /concerne des bénéficiaires qui ne sont pas dans votre portefeuille/
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            /Le créateur de l’événement et les bénéficiaires seront notifiés de la suppression./
          )
        ).toBeInTheDocument()
      })

      describe('quand on modifie le rendez-vous', () => {
        beforeEach(async () => {
          const inputDescription =
            screen.getByLabelText<HTMLInputElement>(/Commentaire/)
          await userEvent.clear(inputDescription)
          await userEvent.type(
            inputDescription,
            'modification de la description'
          )
          const buttonSubmit = screen.getByText('Modifier le rendez-vous')

          // When
          await userEvent.click(buttonSubmit)
        })

        it('affiche une modale de verification', () => {
          // Then
          expect(
            screen.getByText(
              'Vous avez modifié un événement dont vous n’êtes pas le créateur'
            )
          ).toBeInTheDocument()
          expect(updateRendezVous).not.toHaveBeenCalled()
        })

        it('modifie le rendez-vous après la modale', async () => {
          // Given
          const boutonConfirmer = screen.getByRole('button', {
            name: 'Confirmer',
          })

          // When
          await userEvent.click(boutonConfirmer)

          // Then
          expect(updateRendezVous).toHaveBeenCalledWith(evenement.id, {
            jeunesIds: [jeunesConseiller[0].id, 'jeune-autre-conseiller'],
            type: 'AUTRE',
            titre: 'Prise de nouvelles par téléphone',
            modality: modalites[2],
            precision: 'Prise de nouvelles',
            date: '2021-10-21T12:00:00.000+02:00',
            adresse: '36 rue de marseille, 93200 Saint-Denis',
            organisme: 'S.A.R.L',
            duration: 125,
            comment: 'modification de la description',
            presenceConseiller: false,
            invitation: true,
          })
        })
      })
    })

    describe('quand le conseiller connecté n’est référent d’aucun bénéficiaire de l’événement', () => {
      beforeEach(() => {
        // When
        renderWithContexts(
          <EditionRdvPage
            typesRendezVous={typesRendezVous}
            returnTo='https://localhost:3000/agenda'
            evenement={unEvenement()}
            conseillerEstObservateur={true}
            lectureSeule={true}
          />,
          {
            customPortefeuille: { value: [] },
          }
        )
      })

      it('affiche encart explicatif de lecture seule', () => {
        //Then
        expect(
          screen.getByText(
            /Vous pouvez uniquement lire le détail de ce rendez-vous car aucun bénéficiaire de votre portefeuille n’y est inscrit/
          )
        ).toBeInTheDocument()
      })

      it('empêche toute modification', () => {
        // Then
        expect(screen.getByLabelText(/Titre/)).toBeDisabled()
        expect(screen.getByLabelText(/Commentaire/)).toBeDisabled()
        expect(screen.getByLabelText('Modalité')).toBeDisabled()
        expect(screen.getByLabelText(/Date/)).toBeDisabled()
        expect(screen.getByLabelText(/Heure/)).toBeDisabled()
        expect(screen.getByLabelText(/Durée/)).toBeDisabled()
        expect(screen.getByLabelText(/Adresse/)).toBeDisabled()
        expect(screen.getByLabelText(/Organisme/)).toBeDisabled()
        expect(screen.getByLabelText(/conseiller sera présent/)).toBeDisabled()
        expect(
          screen.getByLabelText(
            /Recherchez et ajoutez un ou plusieurs bénéficiaires/
          )
        ).toBeDisabled()
        expect(
          screen.queryByRole('button', { name: /Enlever jeune/ })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /Supprimer/ })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /Annuler/ })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /Modifier/ })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Animation collective', () => {
    let jeunesConseiller: JeuneFromListe[]
    let jeunesAutreConseiller: BaseJeune[]
    let jeunesEtablissement: BaseJeune[]

    let typesRendezVous: TypeEvenementReferentiel[]

    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
    let push: Function
    let refresh: jest.Mock
    beforeEach(() => {
      jeunesConseiller = desItemsJeunes()
      jeunesAutreConseiller = [
        uneBaseJeune({
          id: 'jeune-etablissement-1',
          prenom: 'Jeune Etablissement 1',
        }),
        uneBaseJeune({
          id: 'jeune-etablissement-2',
          prenom: 'Jeune Etablissement 2',
        }),
      ]
      jeunesEtablissement = [
        ...jeunesConseiller.map(({ id, nom, prenom }) => ({ id, nom, prenom })),
        ...jeunesAutreConseiller,
      ]
      ;(supprimerEvenement as jest.Mock).mockResolvedValue(undefined)
      ;(creerEvenement as jest.Mock).mockResolvedValue(
        '963afb47-2b15-46a9-8c0c-0e95240b2eb5'
      )
      ;(getJeunesDeLEtablissementClientSide as jest.Mock).mockResolvedValue(
        jeunesEtablissement
      )
      typesRendezVous = typesAnimationCollective()

      alerteSetter = jest.fn()
      push = jest.fn(() => Promise.resolve())
      refresh = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ push, refresh })
    })

    describe('quand on veut créer une animation collective', () => {
      beforeEach(async () => {
        // Given
        typesRendezVous = typesAnimationCollective()
        await act(async () => {
          renderWithContexts(
            <EditionRdvPage
              typesRendezVous={typesRendezVous}
              returnTo='/agenda?onglet=etablissement'
              evenementTypeAC={true}
              lectureSeule={false}
              conseillerEstObservateur={false}
            />,
            {
              customConseiller: {
                agence: {
                  nom: 'Mission Locale Aubenas',
                  id: 'id-etablissement',
                },
              },
            }
          )
        })
      })

      it('récupère les bénéficiaires de l’établissement', async () => {
        // Then
        expect(getJeunesDeLEtablissementClientSide).toHaveBeenCalledWith(
          'id-etablissement'
        )
        jeunesEtablissement.forEach((jeune) =>
          expect(
            screen.getByRole('option', {
              name: getNomJeuneComplet(jeune),
              hidden: true,
            })
          ).toBeInTheDocument()
        )
      })

      it('le titre est obligatoire', async () => {
        // Given
        const inputTitre = screen.getByRole('textbox', { name: /Titre/ })

        // When
        expect(inputTitre).toHaveAttribute('required', '')
        await userEvent.click(inputTitre)
        await userEvent.tab()

        // Then
        expect(
          screen.getByText('Le champ “Titre” est vide. Renseignez un titre.')
        ).toBeInTheDocument()
      })

      it('les bénéficiaires sont facultatifs', async () => {
        // Given
        const selectType = screen.getByRole('combobox', {
          name: /Type/,
        })
        const inputDate = screen.getByLabelText('* Date format : jj/mm/aaaa')
        const inputHoraire = screen.getByLabelText('* Heure format : hh:mm')
        const inputDuree = screen.getByLabelText('* Durée format : hh:mm')
        const inputTitre = screen.getByLabelText('* Titre')
        await userEvent.selectOptions(selectType, 'Atelier')
        await userEvent.type(inputDate, '2022-03-03')
        await userEvent.type(inputHoraire, '10:30')
        await userEvent.type(inputDuree, '02:37')
        await userEvent.type(inputTitre, 'Titre de l’événement')

        // When
        const buttonValider = screen.getByRole('button', {
          name: 'Créer l’animation collective',
        })
        await userEvent.click(buttonValider)

        // Then
        const selectJeunes = screen.getByRole('combobox', {
          name: /Bénéficiaires/,
        })
        expect(selectJeunes).toHaveAttribute('aria-required', 'false')
        expect(creerEvenement).toHaveBeenCalledWith(
          expect.objectContaining({
            jeunesIds: [],
          })
        )
      })

      it("contient un message pour prévenir qu'il y a des jeunes qui ne sont pas au conseiller", async () => {
        // Given
        await userEvent.type(
          screen.getByLabelText(
            /Recherchez et ajoutez un ou plusieurs bénéficiaires/
          ),
          getNomJeuneComplet(jeunesAutreConseiller[0])
        )

        // Then
        expect(
          screen.getByText(/des bénéficiaires que vous ne suivez pas/)
        ).toBeInTheDocument()
        expect(
          screen.getByLabelText(
            'Ce bénéficiaire n’est pas dans votre portefeuille'
          )
        ).toBeInTheDocument()
      })
    })

    describe('Cloture', () => {
      describe("quand il n'y a pas de statut", () => {
        it("n'affiche pas le lien Clore", async () => {
          // Given
          const evenement = unEvenement()
          delete evenement.statut

          // When
          await act(async () => {
            renderWithContexts(
              <EditionRdvPage
                typesRendezVous={typesRendezVous}
                returnTo='/agenda'
                evenement={evenement}
                evenementTypeAC={true}
                lectureSeule={false}
                conseillerEstObservateur={false}
              />
            )
          })

          // Then
          const cloreButton = screen.queryByRole('link', {
            name: 'Clore',
          })
          expect(cloreButton).not.toBeInTheDocument()
        })
      })

      describe('quand l’animation collection est à venir', () => {
        it("n'affiche pas le lien Clore", async () => {
          // Given
          const evenement = unEvenement({
            statut: StatutAnimationCollective.AVenir,
          })

          // When
          await act(async () => {
            renderWithContexts(
              <EditionRdvPage
                typesRendezVous={typesRendezVous}
                returnTo='/agenda'
                evenement={evenement}
                evenementTypeAC={true}
                lectureSeule={false}
                conseillerEstObservateur={false}
              />
            )
          })

          // Then
          const cloreButton = screen.queryByRole('link', {
            name: 'Clore',
          })
          expect(cloreButton).not.toBeInTheDocument()
        })
      })

      describe('quand l’animation est passée et non close', () => {
        it('affiche un lien pour la clore', async () => {
          // Given
          const evenement = unEvenement({
            statut: StatutAnimationCollective.AClore,
          })

          // When
          await act(async () => {
            renderWithContexts(
              <EditionRdvPage
                typesRendezVous={typesRendezVous}
                returnTo='https://localhost:3000/agenda'
                evenement={evenement}
                evenementTypeAC={true}
                lectureSeule={false}
                conseillerEstObservateur={false}
              />
            )
          })

          // Then
          const cloreButton = screen.getByRole('link', {
            name: 'Clore',
          })
          expect(cloreButton).toHaveAttribute(
            'href',
            `/evenements/${evenement.id}/cloture?redirectUrl=https%3A%2F%2Flocalhost%3A3000%2Fagenda`
          )
        })
      })
    })

    describe('quand on consulte une animation collective close', () => {
      let jeuneAbsent: BaseJeune & { futPresent: boolean }
      let jeunePresent: BaseJeune & { futPresent: boolean }

      beforeEach(async () => {
        jeuneAbsent = {
          id: jeunesConseiller[0].id,
          prenom: jeunesConseiller[0].prenom,
          nom: jeunesConseiller[0].nom,
          futPresent: false,
        }
        jeunePresent = {
          id: jeunesConseiller[1].id,
          prenom: jeunesConseiller[1].prenom,
          nom: jeunesConseiller[1].nom,
          futPresent: true,
        }
        const evenement = unEvenement({
          jeunes: [jeuneAbsent, jeunePresent],
          type: { code: 'ATELIER', label: 'Atelier' },
          statut: StatutAnimationCollective.Close,
        })

        await act(async () => {
          renderWithContexts(
            <EditionRdvPage
              typesRendezVous={typesRendezVous}
              returnTo='/agenda'
              evenement={evenement}
              evenementTypeAC={true}
              lectureSeule={true}
              conseillerEstObservateur={true}
            />,
            {
              customConseiller: {
                agence: {
                  nom: 'Mission Locale Aubenas',
                  id: 'id-etablissement',
                },
              },
            }
          )
        })
      })

      it('ne récupère pas les autres bénéficiaires de l’établissement', async () => {
        // Then
        expect(getJeunesDeLEtablissementClientSide).toHaveBeenCalledTimes(0)
      })

      it('empêche toute modification', () => {
        // Then
        expect(screen.getByLabelText(/Titre/)).toBeDisabled()
        expect(screen.getByLabelText(/Commentaire/)).toBeDisabled()
        expect(screen.getByLabelText('Modalité')).toBeDisabled()
        expect(screen.getByLabelText(/Date/)).toBeDisabled()
        expect(screen.getByLabelText(/Heure/)).toBeDisabled()
        expect(screen.getByLabelText(/Durée/)).toBeDisabled()
        expect(screen.getByLabelText(/Adresse/)).toBeDisabled()
        expect(screen.getByLabelText(/Organisme/)).toBeDisabled()
        expect(screen.getByLabelText(/conseiller sera présent/)).toBeDisabled()
        expect(
          screen.getByLabelText(
            /Recherchez et ajoutez un ou plusieurs bénéficiaires/
          )
        ).toBeDisabled()
        expect(
          screen.queryByText(/bénéficiaires est facultatif/)
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /Enlever jeune/ })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /Supprimer/ })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /Annuler/ })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: /Modifier/ })
        ).not.toBeInTheDocument()
      })

      it('indique les bénéficiaires qui étaient présents', () => {
        // Then
        expect(
          within(
            screen.getByText(getNomJeuneComplet(jeunePresent))
          ).getByLabelText(/Ce bénéficiaire était présent à l’événement/)
        ).toBeInTheDocument()
        expect(
          within(
            screen.getByText(getNomJeuneComplet(jeuneAbsent))
          ).queryByLabelText(/Ce bénéficiaire était présent à l’événement/)
        ).not.toBeInTheDocument()
      })
    })
  })
})
