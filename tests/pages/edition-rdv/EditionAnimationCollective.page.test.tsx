import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import {
  typesRdvAnimationsCollectives,
  typesRdvCEJ,
  uneAnimationCollective,
  unEvenement,
} from 'fixtures/evenement'
import { desItemsJeunes, uneBaseJeune } from 'fixtures/jeune'
import { mockedEvenementsService, mockedJeunesService } from 'fixtures/services'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  Evenement,
  StatutAnimationCollective,
  TypeEvenement,
} from 'interfaces/evenement'
import { BaseJeune, getNomJeuneComplet, JeuneFromListe } from 'interfaces/jeune'
import EditionRdv, { getServerSideProps } from 'pages/mes-jeunes/edition-rdv'
import { AlerteParam } from 'referentiel/alerteParam'
import { modalites } from 'referentiel/evenement'
import { EvenementsService } from 'services/evenements.service'
import { JeunesService } from 'services/jeunes.service'
import getByDescriptionTerm, { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { DATETIME_LONG, toFrenchFormat } from 'utils/date'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('components/Modal')

describe('EditionAnimationCollective', () => {
  describe('server side', () => {
    let jeunesService: JeunesService
    let evenementsService: EvenementsService
    let jeunes: JeuneFromListe[]
    let typesRendezVous: TypeEvenement[]

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
        typesRendezVous = typesRdvAnimationsCollectives()

        jeunesService = mockedJeunesService({
          getJeunesDuConseillerServerSide: jest.fn().mockResolvedValue(jeunes),
        })
        evenementsService = mockedEvenementsService({
          getTypesRendezVous: jest.fn().mockResolvedValue(typesRendezVous),
        })
        ;(withDependance as jest.Mock).mockImplementation((dependance) => {
          if (dependance === 'jeunesService') return jeunesService
          if (dependance === 'evenementsService') return evenementsService
        })
      })

      it('récupère la liste des jeunes du conseiller', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: { referer: '/agenda?onglet=etablissement' } },
          query: { type: 'ac' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(
          jeunesService.getJeunesDuConseillerServerSide
        ).toHaveBeenCalledWith('id-conseiller', 'accessToken')
        expect(actual).toEqual({
          props: {
            jeunes: [jeunes[2], jeunes[0], jeunes[1]],
            withoutChat: true,
            pageTitle: 'Mes événements - Créer une animation collective',
            pageHeader: 'Créer une animation collective',
            returnTo: '/agenda?onglet=etablissement',
            typesRendezVous: expect.arrayContaining([]),
          },
        })
      })

      it('récupère le référentiel des types d’événements de catégorie AC', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: { referer: '/agenda?onglet=etablissement' } },
          query: {},
        } as GetServerSidePropsContext)

        // Then
        expect(evenementsService.getTypesRendezVous).toHaveBeenCalledWith(
          'accessToken'
        )
        expect(actual).toMatchObject({ props: { typesRendezVous } })
      })

      it("récupère la page d'origine", async () => {
        // When
        const actual = await getServerSideProps({
          req: {
            headers: {
              referer: '/agenda?onglet=etablissement',
            },
          },
          query: {},
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: { returnTo: '/agenda?onglet=etablissement' },
        })
      })

      it('récupère le jeune concerné', async () => {
        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: { idJeune: 'id-jeune' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: { idJeune: 'id-jeune' },
        })
      })

      it('récupère l’animation collective concernée', async () => {
        // Given
        ;(evenementsService.getDetailsEvenement as jest.Mock).mockResolvedValue(
          uneAnimationCollective()
        )

        // When
        const actual = await getServerSideProps({
          req: { headers: { referer: '/agenda?onglet=etablissement' } },
          query: { idRdv: 'id-rdv', type: 'ac' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(evenementsService.getDetailsEvenement).toHaveBeenCalledWith(
          'id-rdv',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: {
            evenement: uneAnimationCollective(),
            pageTitle: 'Mes événements - Modifier',
            pageHeader: 'Détail de l’animation collective',
          },
        })
      })

      it('récupère l’url de redirection s’il y en a une', async () => {
        // Given
        ;(evenementsService.getDetailsEvenement as jest.Mock).mockResolvedValue(
          uneAnimationCollective()
        )

        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: { redirectUrl: 'redirectUrl' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: {
            returnTo: 'redirectUrl',
          },
        })
      })

      it("renvoie une 404 si l’animation collective n'existe pas", async () => {
        // Given
        ;(evenementsService.getDetailsEvenement as jest.Mock).mockResolvedValue(
          undefined
        )

        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: { idRdv: 'id-rdv' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({ notFound: true })
      })
    })

    describe('quand l’utilisateur est Pôle Emploi', () => {
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
    let jeunesConseiller: JeuneFromListe[]
    let jeunesAutreConseiller: BaseJeune[]
    let jeunesEtablissement: BaseJeune[]
    let evenementsService: EvenementsService
    let jeunesService: JeunesService
    let typesRendezVous: TypeEvenement[]

    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
    let push: Function
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
      evenementsService = mockedEvenementsService({
        supprimerEvenement: jest.fn(async () => undefined),
        creerEvenement: jest.fn(
          async () => '963afb47-2b15-46a9-8c0c-0e95240b2eb5'
        ),
      })
      jeunesService = mockedJeunesService({
        getJeunesDeLEtablissement: jest.fn(async () => jeunesEtablissement),
      })
      typesRendezVous = typesRdvAnimationsCollectives()

      alerteSetter = jest.fn()
      push = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({ push })
    })

    describe('contenu', () => {
      beforeEach(() => {
        // When
        renderWithContexts(
          <EditionRdv
            jeunes={jeunesConseiller}
            typesRendezVous={typesRendezVous}
            withoutChat={true}
            returnTo='/agenda?onglet=etablissement'
            pageTitle=''
          />,
          {
            customDependances: { evenementsService, jeunesService },
            customConseiller: {
              email: 'fake@email.com',
              agence: { id: 'id-agence', nom: 'Agence Tour' },
            },
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

      describe('étape 1 type d’animation collective', () => {
        let etape: HTMLFieldSetElement
        let selectType: HTMLSelectElement

        it('contient une liste pour choisir un type', () => {
          // Given
          etape = screen.getByRole('group', {
            name: 'Étape 1 Type d’animation collective',
          })
          selectType = within(etape).getByRole('combobox', {
            name: 'Type',
          })
          typesRendezVous = typesRdvAnimationsCollectives()

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
      })

      describe('étape 2 description', () => {
        let etape: HTMLFieldSetElement

        beforeEach(async () => {
          const selectType = screen.getByRole('combobox', {
            name: 'Type',
          })
          await userEvent.selectOptions(selectType, 'Atelier')
          etape = screen.getByRole('group', { name: 'Étape 2 Description' })
        })

        it('contient un champ pour renseigner un titre', () => {
          // Then
          expect(
            within(etape).getByRole('textbox', { name: 'Titre' })
          ).toHaveProperty('required', true)
        })

        it('contient un champ pour saisir une description', () => {
          // Then
          const inputDescription = within(etape).getByRole('textbox', {
            name: /Description/,
          })
          expect(inputDescription).toBeInTheDocument()
          expect(inputDescription).not.toHaveAttribute('required')
        })
      })

      describe('étape 3 bénéficiaires', () => {
        let etape: HTMLFieldSetElement

        beforeEach(async () => {
          const selectType = screen.getByRole('combobox', {
            name: 'Type',
          })
          await userEvent.selectOptions(selectType, 'Atelier')
          etape = screen.getByRole('group', {
            name: 'Étape 3 Ajout de bénéficiaires',
          })
        })

        it('contient une liste pour choisir un jeune', () => {
          // Then
          const selectJeune = within(etape).getByRole('combobox', {
            name: 'Rechercher et ajouter des destinataires Nom et prénom',
          })
          const options = within(etape).getByRole('listbox', { hidden: true })

          expect(selectJeune).toHaveAttribute('aria-required', 'false')
          expect(selectJeune).toHaveAttribute('multiple', '')
          for (const jeune of jeunesConseiller) {
            const jeuneOption = within(options).getByRole('option', {
              name: `${jeune.nom} ${jeune.prenom}`,
              hidden: true,
            })
            expect(jeuneOption).toBeInTheDocument()
          }
        })
      })

      describe('étape 4 lieu et date', () => {
        let etape: HTMLFieldSetElement
        beforeEach(async () => {
          const selectType = screen.getByRole('combobox', {
            name: 'Type',
          })
          await userEvent.selectOptions(selectType, 'Atelier')
          etape = screen.getByRole('group', { name: 'Étape 4 Lieu et date' })
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

      describe('étape 5 gestion accès', () => {
        let etape: HTMLFieldSetElement
        let inputPresenceConseiller: HTMLInputElement
        let inputEmailInvitation: HTMLInputElement
        beforeEach(async () => {
          const selectType = screen.getByRole('combobox', {
            name: 'Type',
          })
          await userEvent.selectOptions(selectType, 'Information collective')
          etape = screen.getByRole('group', {
            name: 'Étape 5 Gestion des accès',
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
    })

    describe('quand on veut créer une animation collective', () => {
      describe('quand le conseiller a une agence', () => {
        beforeEach(async () => {
          // Given
          typesRendezVous = typesRdvAnimationsCollectives()
          renderWithContexts(
            <EditionRdv
              jeunes={jeunesConseiller}
              typesRendezVous={typesRendezVous}
              withoutChat={true}
              returnTo='/agenda?onglet=etablissement'
              pageTitle=''
            />,
            {
              customDependances: {
                evenementsService: evenementsService,
                jeunesService,
              },
              customConseiller: {
                agence: {
                  nom: 'Mission locale Aubenas',
                  id: 'id-etablissement',
                },
              },
            }
          )

          const selectType = screen.getByRole('combobox', {
            name: 'Type',
          })
          await userEvent.selectOptions(selectType, 'Atelier')
        })

        it('récupère les bénéficiaires de l’établissement', async () => {
          // Then
          expect(jeunesService.getJeunesDeLEtablissement).toHaveBeenCalledWith(
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
          const inputTitre = screen.getByRole('textbox', { name: 'Titre' })

          // When
          expect(inputTitre).toHaveAttribute('required', '')
          await userEvent.click(inputTitre)
          await userEvent.tab()

          // Then
          expect(
            screen.getByText(
              'Le champ Titre n’est pas renseigné. Veuillez renseigner un titre.'
            )
          ).toBeInTheDocument()
        })

        it('les bénéficiaires sont facultatifs', async () => {
          // Given
          const inputDate = screen.getByLabelText(
            '* Date (format : jj/mm/aaaa)'
          )
          const inputHoraire = screen.getByLabelText('* Heure (format : hh:mm)')
          const inputDuree = screen.getByLabelText('* Durée (format : hh:mm)')
          const inputTitre = screen.getByLabelText('* Titre')
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
            name: 'Rechercher et ajouter des destinataires Nom et prénom',
          })
          expect(selectJeunes).toHaveAttribute('aria-required', 'false')
          expect(evenementsService.creerEvenement).toHaveBeenCalledWith(
            expect.objectContaining({
              jeunesIds: [],
            })
          )
        })

        it("contient un message pour prévenir qu'il y a des jeunes qui ne sont pas au conseiller", async () => {
          // Given
          await userEvent.type(
            screen.getByLabelText(/ajouter des destinataires/),
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
    })

    describe('Cloture', () => {
      describe("quand il n'y a pas de statut", () => {
        it("n'affiche pas le lien Clore", async () => {
          // Given
          const evenement = unEvenement()
          delete evenement.statut

          // When
          renderWithContexts(
            <EditionRdv
              jeunes={jeunesConseiller}
              typesRendezVous={typesRendezVous}
              withoutChat={true}
              returnTo='/agenda'
              evenement={evenement}
              pageTitle=''
            />,
            { customDependances: { evenementsService } }
          )

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
          renderWithContexts(
            <EditionRdv
              jeunes={jeunesConseiller}
              typesRendezVous={typesRendezVous}
              withoutChat={true}
              returnTo='/agenda'
              evenement={evenement}
              pageTitle=''
            />,
            { customDependances: { evenementsService } }
          )

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
          renderWithContexts(
            <EditionRdv
              jeunes={jeunesConseiller}
              typesRendezVous={typesRendezVous}
              withoutChat={true}
              returnTo='https://localhost:3000/agenda'
              evenement={evenement}
              pageTitle=''
            />,
            { customDependances: { evenementsService } }
          )

          // Then
          const cloreButton = screen.getByRole('link', {
            name: 'Clore',
          })
          expect(cloreButton).toHaveAttribute(
            'href',
            `/evenements/${evenement.id}/cloture?redirectUrl=https%3A%2F%2Flocalhost%3A3000%2Fagenda%3Fonglet%3Detablissement`
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
          type: { code: 'ATELIER', label: 'Atelier', categorie: 'CEJ_AC' },
          statut: StatutAnimationCollective.Close,
        })

        await act(async () => {
          renderWithContexts(
            <EditionRdv
              jeunes={jeunesConseiller}
              typesRendezVous={typesRendezVous}
              withoutChat={true}
              returnTo='/agenda'
              evenement={evenement}
              pageTitle=''
            />,
            {
              customDependances: { evenementsService, jeunesService },
              customConseiller: {
                agence: {
                  nom: 'Mission locale Aubenas',
                  id: 'id-etablissement',
                },
              },
            }
          )
        })
      })

      it('empêche toute modification', () => {
        // Then
        expect(screen.getByLabelText(/Titre/)).toBeDisabled()
        expect(screen.getByLabelText(/Description/)).toBeDisabled()
        expect(screen.getByLabelText('Modalité')).toBeDisabled()
        expect(screen.getByLabelText(/Date/)).toBeDisabled()
        expect(screen.getByLabelText(/Heure/)).toBeDisabled()
        expect(screen.getByLabelText(/Durée/)).toBeDisabled()
        expect(screen.getByLabelText(/Adresse/)).toBeDisabled()
        expect(screen.getByLabelText(/Organisme/)).toBeDisabled()
        expect(screen.getByLabelText(/conseiller sera présent/)).toBeDisabled()
        expect(
          screen.getByLabelText(/ajouter des destinataires/)
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
