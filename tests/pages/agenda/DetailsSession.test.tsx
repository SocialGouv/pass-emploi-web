import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import { unConseiller } from 'fixtures/conseiller'
import { uneBaseJeune } from 'fixtures/jeune'
import { unDetailSession } from 'fixtures/session'
import { StructureConseiller } from 'interfaces/conseiller'
import { BaseJeune } from 'interfaces/jeune'
import { Session } from 'interfaces/session'
import DetailSession, {
  getServerSideProps,
} from 'pages/agenda/sessions/[session_id]'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getJeunesDeLEtablissementServerSide } from 'services/jeunes.service'
import {
  changerInscriptionsSession,
  changerVisibiliteSession,
  getDetailsSession,
} from 'services/sessions.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'
import { DATETIME_LONG, toFrenchFormat, toFrenchString } from 'utils/date'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/conseiller.service')
jest.mock('components/Modal')
jest.mock('components/PageActionsPortal')
jest.mock('services/jeunes.service')
jest.mock('services/sessions.service')

describe('Détails Session', () => {
  describe('client side', () => {
    describe('contenu', () => {
      let session: Session
      let beneficiairesEtablissement: BaseJeune[]
      beforeEach(async () => {
        // Given
        session = unDetailSession()
        beneficiairesEtablissement = [
          uneBaseJeune({
            id: 'jeune-1',
            prenom: 'Harry',
            nom: 'Beau',
          }),
          uneBaseJeune({
            id: 'jeune-2',
            prenom: 'Octo',
            nom: 'Puce',
          }),
        ]
        // When
        await renderWithContexts(
          <DetailSession
            pageTitle=''
            session={session}
            beneficiairesEtablissement={beneficiairesEtablissement}
            returnTo='whatever'
          />
        )
      })

      it('affiche un encart d’information pour la modification sur i-milo', () => {
        expect(
          screen.getByText('Pour modifier la session, rendez-vous sur i-milo.')
        ).toBeInTheDocument()
      })

      it('affiche les détails de l’offre', () => {
        // Then
        expect(screen.getByText('Informations offre')).toBeInTheDocument()
        expect(getByDescriptionTerm('Titre :')).toHaveTextContent(
          session.offre.titre
        )
        expect(getByDescriptionTerm('Type :')).toHaveTextContent(
          session.offre.type
        )
        expect(getByDescriptionTerm('Thème :')).toHaveTextContent(
          session.offre.theme
        )
        expect(getByDescriptionTerm('Description :')).toHaveTextContent(
          session.offre.description!
        )
        expect(getByDescriptionTerm('Partenaire :')).toHaveTextContent(
          session.offre.partenaire!
        )
      })

      it('affiche les détails de la session', () => {
        // Then
        expect(screen.getByText('Informations session')).toBeInTheDocument()
        expect(getByDescriptionTerm('Nom :')).toHaveTextContent(
          session.session.nom
        )
        expect(getByDescriptionTerm('Début :')).toHaveTextContent(
          toFrenchFormat(
            DateTime.fromISO(session.session.dateHeureDebut),
            DATETIME_LONG
          )
        )
        expect(getByDescriptionTerm('Fin :')).toHaveTextContent(
          toFrenchFormat(
            DateTime.fromISO(session.session.dateHeureFin),
            DATETIME_LONG
          )
        )
        expect(
          getByDescriptionTerm('Date limite d’inscription :')
        ).toHaveTextContent(
          toFrenchString(DateTime.fromISO(session.session.dateMaxInscription!))
        )
        expect(getByDescriptionTerm('Animateur :')).toHaveTextContent(
          session.session.animateur!
        )
        expect(getByDescriptionTerm('Lieu :')).toHaveTextContent(
          session.session.lieu
        )
        expect(getByDescriptionTerm('Commentaire :')).toHaveTextContent(
          session.session.commentaire!
        )
      })
    })

    describe('permet de gérer la visibilité de la session', () => {
      let sessionVisible: Session
      let sessionInvisible: Session
      let toggleVisibiliteSession: HTMLInputElement
      let beneficairesEtablissement: BaseJeune[]
      beforeEach(async () => {
        // Given
        sessionVisible = unDetailSession()
        sessionInvisible = unDetailSession({
          session: {
            ...unDetailSession().session,
            id: 'session-invisible-id',
            nom: 'session-invisible',
            dateHeureDebut: '2023-07-04T10:00:00.000+00:00',
            dateHeureFin: '2023-07-04T10:00:00.000+00:00',
            lieu: 'Warneton',
            estVisible: false,
          },
        })
        beneficairesEtablissement = [
          uneBaseJeune({
            id: 'jeune-1',
            prenom: 'Harry',
            nom: 'Beau',
          }),
          uneBaseJeune({
            id: 'jeune-2',
            prenom: 'Octo',
            nom: 'Puce',
          }),
        ]
      })

      it('affiche un switch désactivé par défaut', async () => {
        // When
        await renderWithContexts(
          <DetailSession
            pageTitle=''
            session={sessionInvisible}
            beneficiairesEtablissement={beneficairesEtablissement}
            returnTo='whatever'
          />
        )
        toggleVisibiliteSession = getToggleVisibiliteSession()

        // Then
        expect(toggleVisibiliteSession).toBeInTheDocument()
        expect(toggleVisibiliteSession).not.toBeChecked()
      })
      it('affiche un switch dont la valeur correspond à la visibilité de la session', async () => {
        // When
        await renderWithContexts(
          <DetailSession
            pageTitle=''
            session={sessionVisible}
            beneficiairesEtablissement={beneficairesEtablissement}
            returnTo='whatever'
          />
        )
        toggleVisibiliteSession = getToggleVisibiliteSession()

        // Then
        expect(toggleVisibiliteSession).toBeInTheDocument()
        expect(toggleVisibiliteSession).toBeChecked()
      })

      describe('au clic sur le switch', () => {
        it('change la visibilité', async () => {
          // Given
          ;(changerVisibiliteSession as jest.Mock).mockResolvedValue(undefined)
          await renderWithContexts(
            <DetailSession
              pageTitle=''
              session={sessionInvisible}
              beneficiairesEtablissement={beneficairesEtablissement}
              returnTo='whatever'
            />
          )
          toggleVisibiliteSession = getToggleVisibiliteSession()

          // When
          await userEvent.click(toggleVisibiliteSession)

          // Then
          expect(changerVisibiliteSession).toHaveBeenCalledWith(
            'session-invisible-id',
            true
          )
          expect(toggleVisibiliteSession).toBeChecked()
        })
      })
    })

    describe('permet de gérer la liste des inscrits', () => {
      let session: Session
      let beneficairesEtablissement: BaseJeune[]
      beforeEach(async () => {
        // Given
        beneficairesEtablissement = [
          uneBaseJeune({
            id: 'jeune-1',
            prenom: 'Harry',
            nom: 'Beau',
          }),
          uneBaseJeune({
            id: 'jeune-2',
            prenom: 'Octo',
            nom: 'Puce',
          }),
          uneBaseJeune({
            id: 'jeune-3',
            prenom: 'Maggy',
            nom: 'Carpe',
          }),
          uneBaseJeune({
            id: 'jeune-4',
            prenom: 'Tom',
            nom: 'Sawyer',
          }),
        ]
      })

      describe('contenu', () => {
        beforeEach(async () => {
          session = unDetailSession({
            session: {
              ...unDetailSession().session,
              id: 'session-1',
              nom: 'titre-session',
              dateHeureDebut: DateTime.now()
                .plus({ days: 1, minute: 1 })
                .toString(),
              dateHeureFin: DateTime.now().plus({ days: 1 }).toString(),
              dateMaxInscription: DateTime.now().plus({ days: 1 }).toString(),
              animateur: 'Charles Dupont',
              lieu: 'CEJ Paris',
              commentaire: 'bla',
              estVisible: true,
              nbPlacesDisponibles: 3,
            },
            inscriptions: [
              {
                idJeune: 'jeune-3',
                nom: 'Carpe',
                prenom: 'Maggy',
                statut: 'REFUS_JEUNE',
              },
              {
                idJeune: 'jeune-2',
                nom: 'Puce',
                prenom: 'Octo',
                statut: 'REFUS_TIERS',
              },
              {
                idJeune: 'jeune-1',
                nom: 'Beau',
                prenom: 'Harry',
                statut: 'INSCRIT',
              },
            ],
          })

          await renderWithContexts(
            <DetailSession
              pageTitle=''
              session={session}
              beneficiairesEtablissement={beneficairesEtablissement}
              returnTo='whatever'
            />
          )
        })
        it('affiche la liste des inscrits', () => {
          // Then
          expect(
            screen.getByLabelText(
              `Désinscrire ${beneficairesEtablissement[0].prenom} ${beneficairesEtablissement[0].nom}`
            )
          ).toBeInTheDocument()
          expect(screen.getByText('Refus tiers')).toBeInTheDocument()
          expect(screen.getByText('Refus jeune')).toBeInTheDocument()
        })

        it('permet d’ajouter un bénéficiaire à la liste des inscrits', async () => {
          //Given
          const beneficiaireInput = screen.getByRole('combobox', {
            name: /Recherchez et ajoutez un ou plusieurs bénéficiaires/,
          })

          //When
          await userEvent.type(beneficiaireInput, 'Tom Sawyer')

          //Then
          expect(
            screen.getByLabelText('Désinscrire Tom Sawyer')
          ).toBeInTheDocument()
        })

        it('affiche les boutons de fin de formulaire', () => {
          expect(
            screen.getByRole('link', {
              name: /Annuler/,
            })
          ).toBeInTheDocument()

          expect(
            screen.getByRole('button', {
              name: /Enregistrer les modifications/,
            })
          ).toBeInTheDocument()
        })
      })

      describe('au clic sur le bouton d’annulation', () => {
        it('réinitialise la liste des inscrits', async () => {
          //Given
          session = unDetailSession({
            session: {
              ...unDetailSession().session,
              id: 'session-1',
              nom: 'titre-session',
              dateHeureDebut: DateTime.now()
                .plus({ days: 1, minute: 1 })
                .toString(),
              dateHeureFin: DateTime.now().plus({ days: 1 }).toString(),
              dateMaxInscription: DateTime.now().plus({ days: 1 }).toString(),
              animateur: 'Charles Dupont',
              lieu: 'CEJ Paris',
              commentaire: 'bla',
              estVisible: true,
              nbPlacesDisponibles: 3,
            },
            inscriptions: [
              {
                idJeune: 'jeune-1',
                nom: 'Beau',
                prenom: 'Harry',
                statut: 'INSCRIT',
              },
            ],
          })
          await renderWithContexts(
            <DetailSession
              pageTitle=''
              session={session}
              beneficiairesEtablissement={beneficairesEtablissement}
              returnTo='whatever'
            />
          )
          const beneficiaireInput = screen.getByRole('combobox', {
            name: /Recherchez et ajoutez un ou plusieurs bénéficiaires/,
          })
          const annulerBtn = screen.getByRole('link', {
            name: /Annuler/,
          })

          //When
          await userEvent.type(beneficiaireInput, 'Octo Puce')
          await userEvent.click(annulerBtn)

          //Then
          expect(screen.getByText('Octo Puce')).toBeInTheDocument()
        })
      })

      describe('au clic sur le bouton d’enregistrement', () => {
        it('appelle la méthode changerInscriptionsSession', async () => {
          //Given
          let routerPush: Function = jest.fn()

          ;(useRouter as jest.Mock).mockReturnValue({
            push: routerPush,
          })
          ;(changerInscriptionsSession as jest.Mock).mockResolvedValue(
            undefined
          )
          session = unDetailSession({
            session: {
              ...unDetailSession().session,
              id: 'session-1',
              nom: 'titre-session',
              dateHeureDebut: DateTime.now()
                .plus({ days: 1, minute: 1 })
                .toString(),
              dateHeureFin: DateTime.now().plus({ days: 1 }).toString(),
              dateMaxInscription: DateTime.now().plus({ days: 1 }).toString(),
              animateur: 'Charles Dupont',
              lieu: 'CEJ Paris',
              commentaire: 'bla',
              estVisible: true,
              nbPlacesDisponibles: 3,
            },
            inscriptions: [
              {
                idJeune: 'jeune-1',
                nom: 'Beau',
                prenom: 'Harry',
                statut: 'INSCRIT',
              },
            ],
          })

          await renderWithContexts(
            <DetailSession
              pageTitle=''
              session={session}
              beneficiairesEtablissement={beneficairesEtablissement}
              returnTo='whatever'
            />
          )
          const beneficiaireInput = screen.getByRole('combobox', {
            name: /Recherchez et ajoutez un ou plusieurs bénéficiaires/,
          })
          const enregistrerBtn = screen.getByRole('button', {
            name: /Enregistrer les modifications/,
          })

          //When
          await userEvent.type(beneficiaireInput, 'Octo Puce')
          await userEvent.click(enregistrerBtn)

          //Then
          expect(changerInscriptionsSession).toHaveBeenCalledWith('session-1', [
            { commentaire: undefined, idJeune: 'jeune-2', statut: 'INSCRIT' },
            { commentaire: undefined, idJeune: 'jeune-1', statut: 'INSCRIT' },
          ])
        })
      })
    })

    describe('si la date limite d’inscription est dépassée', () => {
      let session: Session
      let beneficairesEtablissement: BaseJeune[]
      beforeEach(async () => {
        // Given
        beneficairesEtablissement = [
          uneBaseJeune({
            id: 'jeune-1',
            prenom: 'Harry',
            nom: 'Beau',
          }),
        ]

        session = unDetailSession({
          session: {
            id: 'session-1',
            nom: 'titre-session',
            dateHeureDebut: DateTime.now().minus({ minute: 1 }).toString(),
            dateHeureFin: DateTime.now().toString(),
            dateMaxInscription: DateTime.now().minus({ days: 1 }).toString(),
            animateur: 'Charles Dupont',
            lieu: 'CEJ Paris',
            commentaire: 'bla',
            estVisible: true,
            nbPlacesDisponibles: 3,
            statut: 'AClore',
          },
          inscriptions: [
            {
              idJeune: 'jeune-1',
              nom: 'Beau',
              prenom: 'Harry',
              statut: 'INSCRIT',
            },
          ],
        })

        await renderWithContexts(
          <DetailSession
            pageTitle=''
            session={session}
            beneficiairesEtablissement={beneficairesEtablissement}
            returnTo='whatever'
          />
        )
      })

      it('affiche un message d’alerte pour continuer d’inscrire des bénéficiaires', () => {
        //Then
        expect(
          screen.getByText(
            'La date limite d’inscription est atteinte. Toutefois, il est encore possible d’inscrire des bénéficiaires jusqu’à la date de début de la session.'
          )
        ).toBeInTheDocument()
      })
    })

    describe('si la date de fin est dépassée', () => {
      let session: Session
      let beneficairesEtablissement: BaseJeune[]
      beforeEach(async () => {
        // Given
        beneficairesEtablissement = [
          uneBaseJeune({
            id: 'jeune-1',
            prenom: 'Harry',
            nom: 'Beau',
          }),
        ]

        session = unDetailSession({
          session: {
            id: 'session-1',
            nom: 'titre-session',
            dateHeureDebut: DateTime.now()
              .minus({ days: 1, minute: 1 })
              .toString(),
            dateHeureFin: DateTime.now().minus({ days: 1 }).toString(),
            dateMaxInscription: DateTime.now().minus({ days: 2 }).toString(),
            animateur: 'Charles Dupont',
            lieu: 'CEJ Paris',
            commentaire: 'bla',
            estVisible: true,
            nbPlacesDisponibles: 3,
            statut: 'AClore',
          },
          inscriptions: [
            {
              idJeune: 'jeune-1',
              nom: 'Beau',
              prenom: 'Harry',
              statut: 'INSCRIT',
            },
          ],
        })

        await renderWithContexts(
          <DetailSession
            pageTitle=''
            session={session}
            beneficiairesEtablissement={beneficairesEtablissement}
            returnTo='whatever'
          />
        )
      })

      it('affiche un message d’alerte', () => {
        //Then
        expect(
          screen.getByText(
            'Les inscriptions ne sont plus possibles car la date limite est atteinte.'
          )
        ).toBeInTheDocument()
      })

      it('désactive le champs de recherche des bénéficiaires', () => {
        expect(
          screen.getByRole('combobox', {
            name: /Recherchez et ajoutez un ou plusieurs bénéficiaires/,
          })
        ).toBeDisabled()
      })

      it('n’affiche pas le bouton désinscrire', () => {
        expect(() =>
          screen.getByRole('button', { name: /Désinscrire/ })
        ).toThrow()
      })

      it('n’affiche pas les boutons de soumission du formulaire', () => {
        expect(() => screen.getByRole('link', { name: /Annuler/ })).toThrow()
        expect(() =>
          screen.getByRole('button', {
            name: /Enregistrer les modifications/,
          })
        ).toThrow()
      })
    })

    describe('permet de désinscrire un bénéficiaire', () => {
      let session: Session
      let beneficairesEtablissement: BaseJeune[]
      beforeEach(async () => {
        // Given
        beneficairesEtablissement = [
          uneBaseJeune({
            id: 'jeune-1',
            prenom: 'Harry',
            nom: 'Beau',
          }),
          uneBaseJeune({
            id: 'jeune-2',
            prenom: 'Octo',
            nom: 'Puce',
          }),
          uneBaseJeune({
            id: 'jeune-3',
            prenom: 'Maggy',
            nom: 'Carpe',
          }),
          uneBaseJeune({
            id: 'jeune-4',
            prenom: 'Tom',
            nom: 'Sawyer',
          }),
        ]
      })

      it('si le bénéficiaire n’était pas inscrit', async () => {
        session = unDetailSession({
          session: {
            ...unDetailSession().session,
            id: 'session-1',
            nom: 'titre-session',
            dateHeureDebut: DateTime.now()
              .plus({ days: 1, minute: 1 })
              .toString(),
            dateHeureFin: DateTime.now().plus({ days: 1 }).toString(),
            dateMaxInscription: DateTime.now().plus({ days: 1 }).toString(),
            animateur: 'Charles Dupont',
            lieu: 'CEJ Paris',
            commentaire: 'bla',
            estVisible: true,
            nbPlacesDisponibles: 3,
          },
          inscriptions: [],
        })

        await renderWithContexts(
          <DetailSession
            pageTitle=''
            session={session}
            beneficiairesEtablissement={beneficairesEtablissement}
            returnTo='whatever'
          />
        )

        const beneficiaireInput = screen.getByRole('combobox', {
          name: /Recherchez et ajoutez un ou plusieurs bénéficiaires/,
        })
        await userEvent.type(beneficiaireInput, 'Octo Puce')
        const desinscriptionBtn = screen.getByRole('button', {
          name: /Désinscrire Octo Puce/,
        })

        //When
        await userEvent.click(desinscriptionBtn)

        //Then
        expect(desinscriptionBtn).not.toBeInTheDocument()
      })

      describe('si le bénéficiaire était inscrit', () => {
        beforeEach(async () => {
          session = unDetailSession({
            session: {
              ...unDetailSession().session,
              id: 'session-1',
              nom: 'titre-session',
              dateHeureDebut: DateTime.now()
                .plus({ days: 1, minute: 1 })
                .toString(),
              dateHeureFin: DateTime.now().plus({ days: 1 }).toString(),
              dateMaxInscription: DateTime.now().plus({ days: 1 }).toString(),
              animateur: 'Charles Dupont',
              lieu: 'CEJ Paris',
              commentaire: 'bla',
              estVisible: true,
              nbPlacesDisponibles: 3,
            },
            inscriptions: [
              {
                idJeune: 'jeune-2',
                prenom: 'Octo',
                nom: 'Puce',
                statut: 'INSCRIT',
              },
            ],
          })

          renderWithContexts(
            <DetailSession
              pageTitle=''
              session={session}
              beneficiairesEtablissement={beneficairesEtablissement}
              returnTo='whatever'
            />
          )

          const desinscriptionInput = screen.getByRole('button', {
            name: /Désinscrire Octo Puce/,
          })

          //When
          await userEvent.click(desinscriptionInput)
        })

        it('affiche la modale de désinscription', () => {
          //Then
          expect(
            screen.getByRole('radio', { name: /J’ai fait une erreur/ })
          ).toBeInTheDocument()
          expect(
            screen.getByRole('radio', { name: /Refus tiers/ })
          ).toBeInTheDocument()
          expect(
            screen.getByRole('radio', { name: /Refus jeune/ })
          ).toBeInTheDocument()
          expect(
            screen.getByRole('textbox', { name: /Veuillez préciser le motif/ })
          ).toBeInTheDocument()
          expect(
            screen.getByRole('textbox', { name: /Veuillez préciser le motif/ })
          ).toBeDisabled()
        })

        it('permet d’activer le champs de saisie du motif de désinscription', async () => {
          //When
          const refusJeuneBtn = screen.getByRole('radio', {
            name: /Refus jeune/,
          })

          //When
          await userEvent.click(refusJeuneBtn)

          //Then
          expect(
            screen.getByRole('textbox', { name: /Veuillez préciser le motif/ })
          ).not.toBeDisabled()
        })
      })
    })

    describe('permet de réinscrire un bénéficiaire', () => {
      //Given
      let session: Session
      let beneficairesEtablissement: BaseJeune[]

      beforeEach(async () => {
        session = unDetailSession({
          session: {
            ...unDetailSession().session,

            id: 'session-1',
            nom: 'titre-session',
            dateHeureDebut: DateTime.now()
              .plus({ days: 1, minute: 1 })
              .toString(),
            dateHeureFin: DateTime.now().plus({ days: 1 }).toString(),
            dateMaxInscription: DateTime.now().plus({ days: 1 }).toString(),
            animateur: 'Charles Dupont',
            lieu: 'CEJ Paris',
            commentaire: 'bla',
            estVisible: true,
            nbPlacesDisponibles: 3,
          },
          inscriptions: [
            {
              idJeune: 'idHarryBeau',
              nom: 'Beau',
              prenom: 'Harry',
              statut: 'REFUS_TIER',
            },
          ],
        })

        beneficairesEtablissement = [
          uneBaseJeune({
            id: 'idHarryBeau',
            prenom: 'Harry',
            nom: 'Beau',
          }),
        ]

        await renderWithContexts(
          <DetailSession
            pageTitle=''
            session={session}
            beneficiairesEtablissement={beneficairesEtablissement}
            returnTo='whatever'
          />
        )
      })

      it('affiche le bouton de réinscription du bénéficiaire désinscrit', async () => {
        //Then

        expect(
          screen.getByRole('button', {
            name: /Réinscrire Harry Beau/,
          })
        ).toBeInTheDocument()
      })

      it('au clic sur le bouton de réinscription, change le statut du bénéficiaire', async () => {
        //Given
        let routerPush: Function = jest.fn()

        ;(useRouter as jest.Mock).mockReturnValue({
          push: routerPush,
        })
        ;(changerInscriptionsSession as jest.Mock).mockResolvedValue(undefined)

        const reinscriptionBeneficiaireBtn = screen.getByRole('button', {
          name: /Réinscrire Harry Beau/,
        })
        const validationBtn = screen.getByRole('button', {
          name: /Enregistrer/,
        })

        //When
        await userEvent.click(reinscriptionBeneficiaireBtn)
        await userEvent.click(validationBtn)

        //Then
        expect(() =>
          screen.getByRole('button', {
            name: /Réinscrire Harry Beau/,
          })
        ).toThrow()

        expect(
          screen.getByRole('button', {
            name: /Désinscrire Harry Beau/,
          })
        ).toBeInTheDocument()

        expect(changerInscriptionsSession).toHaveBeenCalledWith('session-1', [
          { commentaire: undefined, idJeune: 'idHarryBeau', statut: 'INSCRIT' },
        ])
      })
    })

    describe('Cloture', () => {
      describe('quand la session est à venir', () => {
        it("n'affiche pas le lien Clore", async () => {
          let session: Session
          let beneficairesEtablissement: BaseJeune[]
          // Given
          beneficairesEtablissement = [uneBaseJeune()]

          session = unDetailSession({
            session: {
              ...unDetailSession().session,
              statut: 'AVenir',
            },
          })

          await renderWithContexts(
            <DetailSession
              pageTitle=''
              session={session}
              beneficiairesEtablissement={beneficairesEtablissement}
              returnTo='whatever'
            />
          )

          // Then
          const cloreButton = screen.queryByRole('link', {
            name: 'Clore',
          })
          expect(cloreButton).not.toBeInTheDocument()
        })
      })

      describe('quand la session est passée et non close', () => {
        let session: Session
        let beneficairesEtablissement: BaseJeune[]
        beforeEach(async () => {
          // Given
          beneficairesEtablissement = [
            uneBaseJeune({
              id: 'jeune-1',
              prenom: 'Harry',
              nom: 'Beau',
            }),
          ]

          session = unDetailSession({
            session: {
              ...unDetailSession().session,
              dateHeureDebut: DateTime.now()
                .plus({ days: 1, minute: 1 })
                .toString(),
              dateHeureFin: DateTime.now().plus({ days: 1 }).toString(),
              dateMaxInscription: DateTime.now().minus({ days: 1 }).toString(),
              nbPlacesDisponibles: 3,
              statut: 'AClore',
            },
          })

          await renderWithContexts(
            <DetailSession
              pageTitle=''
              session={session}
              beneficiairesEtablissement={beneficairesEtablissement}
              returnTo='whatever'
            />
          )
        })

        it('affiche un message d’alerte', () => {
          //Then
          expect(
            screen.getByText('Cet événement est passé et doit être clos.')
          ).toBeInTheDocument()
        })

        it('affiche un lien pour Clore', () => {
          //Then
          expect(screen.getByRole('link', { name: 'Clore' })).toHaveAttribute(
            'href',
            `/agenda/sessions/${session.session.id}/cloture?redirectUrl=whatever`
          )
        })
      })
    })
  })

  describe('server side', () => {
    beforeEach(() => {
      process.env = Object.assign(process.env, {
        IDS_STRUCTURES_EARLY_ADOPTERS: 'id-test',
      })
      ;(getDetailsSession as jest.Mock).mockResolvedValue(unDetailSession())
    })

    describe('Quand le conseiller est Pôle emploi', () => {
      it('renvoie une 404', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { structure: 'POLE_EMPLOI' },
          },
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
        expect(getDetailsSession).not.toHaveBeenCalled()
        expect(actual).toEqual({ notFound: true })
      })
    })

    describe('Quand le conseiller est Milo', () => {
      let actual: GetServerSidePropsResult<any>
      describe('quand conseiller est d’une agence early adopter', () => {
        it('recupère le détail de la session', async () => {
          // Given
          ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
            session: {
              user: { structure: 'MILO', id: 'id-conseiller' },
              accessToken: 'accessToken',
            },
            validSession: true,
          })
          ;(getJeunesDeLEtablissementServerSide as jest.Mock).mockReturnValue([
            uneBaseJeune({
              id: 'jeune-1',
              prenom: 'Harry',
              nom: 'Beau',
            }),
            uneBaseJeune({
              id: 'jeune-2',
              prenom: 'Octo',
              nom: 'Puce',
            }),
          ])
          ;(getConseillerServerSide as jest.Mock).mockReturnValue(
            unConseiller({
              id: 'id-conseiller',
              structureMilo: { nom: 'Agence early', id: 'id-test' },
            })
          )

          // When
          actual = await getServerSideProps({
            req: { headers: {} },
            query: { session_id: 'id-session' },
          } as unknown as GetServerSidePropsContext)

          // Then
          expect(getDetailsSession).toHaveBeenCalledWith(
            'id-conseiller',
            'id-session',
            'accessToken'
          )
        })

        it('prépare la page', async () => {
          // Given
          const beneficiairesEtablissement = [
            uneBaseJeune({
              id: 'jeune-1',
              prenom: 'Harry',
              nom: 'Beau',
            }),
            uneBaseJeune({
              id: 'jeune-2',
              prenom: 'Octo',
              nom: 'Puce',
            }),
          ]
          ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
            validSession: true,
            session: {
              user: { structure: 'MILO' },
            },
          })
          ;(getJeunesDeLEtablissementServerSide as jest.Mock).mockReturnValue(
            beneficiairesEtablissement
          )
          ;(getConseillerServerSide as jest.Mock).mockReturnValue(
            unConseiller({
              id: 'id-conseiller',
              structure: StructureConseiller.MILO,
              agence: {
                nom: 'milo-aubenas',
                id: 'id-test',
              },
              structureMilo: {
                nom: 'milo-aubenas',
                id: 'id-test',
              },
            })
          )

          const session = unDetailSession()

          // When
          const actual = await getServerSideProps({
            req: { headers: {} },
            query: {},
          } as GetServerSidePropsContext)

          // Then
          expect(actual).toEqual({
            props: {
              beneficiairesEtablissement: beneficiairesEtablissement,
              pageTitle: `Détail session ${session.session.nom} - Agenda`,
              pageHeader: 'Détail de la session i-milo',
              returnTo: '/mes-jeunes',
              session: session,
              withoutChat: true,
            },
          })
        })
      })
    })
  })
})

function getToggleVisibiliteSession() {
  return screen.getByRole<HTMLInputElement>('checkbox', {
    name: /Rendre visible la session/,
  })
}
