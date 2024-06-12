import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'

import DetailsSessionPage from 'app/(connected)/(with-sidebar)/(without-chat)/agenda/sessions/[idSession]/DetailsSessionPage'
import { uneBaseJeune } from 'fixtures/jeune'
import { unDetailSession } from 'fixtures/session'
import { CategorieSituation, JeuneEtablissement } from 'interfaces/jeune'
import { Session } from 'interfaces/session'
import {
  changerInscriptionsSession,
  changerVisibiliteSession,
} from 'services/sessions.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/conseiller.service')
jest.mock('components/Modal')
jest.mock('components/PageActionsPortal')
jest.mock('services/jeunes.service')
jest.mock('services/sessions.service')

describe('Détails Session Page Client', () => {
  describe('contenu', () => {
    let session: Session
    let beneficiaires: JeuneEtablissement[]
    beforeEach(async () => {
      // Given
      session = unDetailSession()
      session.session.dateMaxInscription = '2023-06-17'
      beneficiaires = [
        {
          base: uneBaseJeune({
            id: 'jeune-1',
            prenom: 'Harry',
            nom: 'Beau',
          }),
          referent: {
            id: 'id-conseiller',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
        {
          base: uneBaseJeune({
            id: 'jeune-2',
            prenom: 'Octo',
            nom: 'Puce',
          }),
          referent: {
            id: 'id-conseiller',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
      ]
      // When
      renderWithContexts(
        <DetailsSessionPage
          session={session}
          beneficiairesStructureMilo={beneficiaires}
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
        DateTime.fromISO(session.session.dateHeureDebut).toFormat(
          `dd/MM/yyyy 'à' HH'h'mm`
        )
      )
      expect(getByDescriptionTerm('Fin :')).toHaveTextContent(
        DateTime.fromISO(session.session.dateHeureFin).toFormat(
          `dd/MM/yyyy 'à' HH'h'mm`
        )
      )
      expect(
        getByDescriptionTerm('Date limite d’inscription :')
      ).toHaveTextContent(
        DateTime.fromISO(session.session.dateMaxInscription!).toFormat(
          'dd/MM/yyyy'
        )
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
    let beneficaires: JeuneEtablissement[]
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
      beneficaires = [
        {
          base: uneBaseJeune({
            id: 'jeune-1',
            prenom: 'Harry',
            nom: 'Beau',
          }),
          referent: {
            id: 'id-conseiller',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
        {
          base: uneBaseJeune({
            id: 'jeune-2',
            prenom: 'Octo',
            nom: 'Puce',
          }),
          referent: {
            id: 'id-conseiller',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
      ]
    })

    it('affiche un switch désactivé par défaut', async () => {
      // When
      renderWithContexts(
        <DetailsSessionPage
          session={sessionInvisible}
          beneficiairesStructureMilo={beneficaires}
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
      renderWithContexts(
        <DetailsSessionPage
          session={sessionVisible}
          beneficiairesStructureMilo={beneficaires}
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
        renderWithContexts(
          <DetailsSessionPage
            session={sessionInvisible}
            beneficiairesStructureMilo={beneficaires}
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
    let beneficaires: JeuneEtablissement[]
    beforeEach(async () => {
      // Given
      beneficaires = [
        {
          base: uneBaseJeune({
            id: 'jeune-1',
            prenom: 'Harry',
            nom: 'Beau',
          }),
          referent: {
            id: 'id-conseiller',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
        {
          base: uneBaseJeune({
            id: 'jeune-2',
            prenom: 'Octo',
            nom: 'Puce',
          }),
          referent: {
            id: 'id-conseiller',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
        {
          base: uneBaseJeune({
            id: 'jeune-3',
            prenom: 'Maggy',
            nom: 'Carpe',
          }),
          referent: {
            id: 'id-conseiller',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
        {
          base: uneBaseJeune({
            id: 'jeune-4',
            prenom: 'Tom',
            nom: 'Sawyer',
          }),
          referent: {
            id: 'id-conseiller',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
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

        renderWithContexts(
          <DetailsSessionPage
            session={session}
            beneficiairesStructureMilo={beneficaires}
            returnTo='whatever'
          />
        )
      })

      it('affiche la liste des inscrits', () => {
        // Then
        expect(
          screen.getByLabelText(
            `Désinscrire ${beneficaires[0].base.prenom} ${beneficaires[0].base.nom}`
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

    describe('au clic sur le bouton d’enregistrement', () => {
      it('appelle la méthode changerInscriptionsSession', async () => {
        //Given
        let push: Function = jest.fn()
        let refresh: Function = jest.fn()

        ;(useRouter as jest.Mock).mockReturnValue({
          push,
          refresh,
        })
        ;(changerInscriptionsSession as jest.Mock).mockResolvedValue(undefined)
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

        renderWithContexts(
          <DetailsSessionPage
            session={session}
            beneficiairesStructureMilo={beneficaires}
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
    let beneficaires: JeuneEtablissement[]
    beforeEach(async () => {
      // Given
      beneficaires = [
        {
          base: uneBaseJeune({
            id: 'jeune-1',
            prenom: 'Harry',
            nom: 'Beau',
          }),
          referent: {
            id: 'id-conseiller',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
      ]

      session = unDetailSession({
        session: {
          id: 'session-1',
          nom: 'titre-session',
          dateHeureDebut: DateTime.now().plus({ day: 1 }).toString(),
          dateHeureFin: DateTime.now().plus({ day: 2 }).toString(),
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

      renderWithContexts(
        <DetailsSessionPage
          session={session}
          beneficiairesStructureMilo={beneficaires}
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
  })

  describe('si la date de début est dépassée', () => {
    let session: Session
    let beneficaires: JeuneEtablissement[]
    beforeEach(async () => {
      // Given
      beneficaires = [
        {
          base: uneBaseJeune({
            id: 'jeune-1',
            prenom: 'Harry',
            nom: 'Beau',
          }),
          referent: {
            id: 'id-conseiller',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
      ]

      session = unDetailSession({
        session: {
          id: 'session-1',
          nom: 'titre-session',
          dateHeureDebut: DateTime.now().minus({ days: 1 }).toString(),
          dateHeureFin: DateTime.now().toString(),
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

      renderWithContexts(
        <DetailsSessionPage
          session={session}
          beneficiairesStructureMilo={beneficaires}
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
    let beneficaires: JeuneEtablissement[]
    beforeEach(async () => {
      // Given
      beneficaires = [
        {
          base: uneBaseJeune({
            id: 'jeune-1',
            prenom: 'Harry',
            nom: 'Beau',
          }),
          referent: {
            id: 'id-conseiller',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
        {
          base: uneBaseJeune({
            id: 'jeune-2',
            prenom: 'Octo',
            nom: 'Puce',
          }),
          referent: {
            id: 'id-conseiller',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
        {
          base: uneBaseJeune({
            id: 'jeune-3',
            prenom: 'Maggy',
            nom: 'Carpe',
          }),
          referent: {
            id: 'id-conseiller',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
        {
          base: uneBaseJeune({
            id: 'jeune-4',
            prenom: 'Tom',
            nom: 'Sawyer',
          }),
          referent: {
            id: 'id-conseiller',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
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

      renderWithContexts(
        <DetailsSessionPage
          session={session}
          beneficiairesStructureMilo={beneficaires}
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
          <DetailsSessionPage
            session={session}
            beneficiairesStructureMilo={beneficaires}
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
    let beneficaires: JeuneEtablissement[]

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

      beneficaires = [
        {
          base: uneBaseJeune({
            id: 'idHarryBeau',
            prenom: 'Harry',
            nom: 'Beau',
          }),
          referent: {
            id: 'id-conseiller',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
      ]

      renderWithContexts(
        <DetailsSessionPage
          session={session}
          beneficiairesStructureMilo={beneficaires}
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
      let push: Function = jest.fn()
      let refresh: Function = jest.fn()

      ;(useRouter as jest.Mock).mockReturnValue({
        push,
        refresh,
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
        let beneficairesEtablissement: JeuneEtablissement[]
        // Given
        beneficairesEtablissement = [
          {
            base: uneBaseJeune(),
            referent: {
              id: 'id-conseiller',
              nom: 'Le Calamar',
              prenom: 'Carlo',
            },
            situation: CategorieSituation.EMPLOI,
            dateDerniereActivite: '2023-03-01T14:11:38.040Z',
          },
        ]

        session = unDetailSession({
          session: {
            ...unDetailSession().session,
            statut: 'AVenir',
          },
        })

        renderWithContexts(
          <DetailsSessionPage
            session={session}
            beneficiairesStructureMilo={beneficairesEtablissement}
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
      let beneficaires: JeuneEtablissement[]
      beforeEach(async () => {
        // Given
        beneficaires = [
          {
            base: uneBaseJeune({
              id: 'jeune-1',
              prenom: 'Harry',
              nom: 'Beau',
            }),
            referent: {
              id: 'id-conseiller',
              nom: 'Le Calamar',
              prenom: 'Carlo',
            },
            situation: CategorieSituation.EMPLOI,
            dateDerniereActivite: '2023-03-01T14:11:38.040Z',
          },
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

        renderWithContexts(
          <DetailsSessionPage
            session={session}
            beneficiairesStructureMilo={beneficaires}
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

function getToggleVisibiliteSession() {
  return screen.getByRole<HTMLInputElement>('checkbox', {
    name: /Rendre visible la session/,
  })
}
