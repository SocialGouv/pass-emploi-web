import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'

import DetailsSessionPage from 'app/(connected)/(with-sidebar)/(without-chat)/agenda/sessions/[idSession]/DetailsSessionPage'
import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import { unDetailSession } from 'fixtures/session'
import {
  BeneficiaireEtablissement,
  CategorieSituation,
} from 'interfaces/beneficiaire'
import { Session } from 'interfaces/session'
import {
  changerAutoinscriptionSession,
  changerInscriptionsSession,
  changerVisibiliteSession,
} from 'services/sessions.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/conseiller.service')
jest.mock('components/ModalContainer')
jest.mock('components/PageActionsPortal')
jest.mock('services/beneficiaires.service')
jest.mock('services/sessions.service')

describe('Détails Session Page Client', () => {
  let container: HTMLElement

  describe('contenu', () => {
    let session: Session
    beforeEach(async () => {
      // Given
      session = unDetailSession()
      session.session.dateMaxInscription = '2023-06-17'

      // When
      ;({ container } = await renderWithContexts(
        <DetailsSessionPage
          session={session}
          beneficiairesStructureMilo={[]}
          returnTo='whatever'
        />
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
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
          `dd/MM/yyyy 'à' HH':'mm`
        )
      )
      expect(getByDescriptionTerm('Fin :')).toHaveTextContent(
        DateTime.fromISO(session.session.dateHeureFin).toFormat(
          `dd/MM/yyyy 'à' HH':'mm`
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
    const sessionInvisible = unDetailSession({
      session: {
        ...unDetailSession().session,
        estVisible: false,
        autoinscription: false,
      },
    })

    it('affiche un switch désactivé par défaut', async () => {
      // When
      await renderWithContexts(
        <DetailsSessionPage
          session={sessionInvisible}
          beneficiairesStructureMilo={[]}
          returnTo='whatever'
        />
      )
      const toggleVisibiliteSession = getToggleVisibiliteSession()

      // Then
      expect(toggleVisibiliteSession).not.toBeChecked()
    })

    it('affiche un switch dont la valeur correspond à la visibilité de la session', async () => {
      // Given
      const sessionVisible = unDetailSession()

      // When
      await renderWithContexts(
        <DetailsSessionPage
          session={sessionVisible}
          beneficiairesStructureMilo={[]}
          returnTo='whatever'
        />
      )
      const toggleVisibiliteSession = getToggleVisibiliteSession()

      // Then
      expect(toggleVisibiliteSession).toBeChecked()
    })

    describe('au clic sur le switch', () => {
      it('change la visibilité', async () => {
        // Given
        ;(changerVisibiliteSession as jest.Mock).mockResolvedValue(undefined)
        await renderWithContexts(
          <DetailsSessionPage
            session={sessionInvisible}
            beneficiairesStructureMilo={[]}
            returnTo='whatever'
          />
        )
        const toggleVisibiliteSession = getToggleVisibiliteSession()

        // When
        await userEvent.click(toggleVisibiliteSession)

        // Then
        expect(changerVisibiliteSession).toHaveBeenCalledWith('session-1', true)
        expect(toggleVisibiliteSession).toBeChecked()
      })

      it('ne change pas la visibilité si l’autoinscription est activée', async () => {
        // Given
        ;(changerVisibiliteSession as jest.Mock).mockResolvedValue(undefined)
        await renderWithContexts(
          <DetailsSessionPage
            session={{
              ...sessionInvisible,
              session: {
                ...sessionInvisible.session,
                estVisible: true,
                autoinscription: true,
              },
            }}
            beneficiairesStructureMilo={[]}
            returnTo='whatever'
          />
        )
        const toggleVisibiliteSession = getToggleVisibiliteSession()

        // When
        await userEvent.click(toggleVisibiliteSession)

        // Then
        expect(changerVisibiliteSession).toHaveBeenCalledTimes(0)
        expect(toggleVisibiliteSession).toBeChecked()
      })
    })
  })

  describe('permet de gérer l’autoinscription des bénéficiaires à la session', () => {
    const sessionOnPeutPasSAutoinscrire = unDetailSession({
      session: {
        ...unDetailSession().session,
        estVisible: false,
        autoinscription: false,
      },
    })

    it('affiche un switch désactivé par défaut', async () => {
      // When
      await renderWithContexts(
        <DetailsSessionPage
          session={sessionOnPeutPasSAutoinscrire}
          beneficiairesStructureMilo={[]}
          returnTo='whatever'
        />
      )
      const toggleAutoinscription = getToggleAutoinscriptionSession()

      // Then
      expect(toggleAutoinscription).not.toBeChecked()
    })

    it('affiche un switch dont la valeur correspond à la possibilité de s’autoinscrire à la session', async () => {
      // Given
      const sessionOnPeutSAutoinscrire = unDetailSession()

      // When
      await renderWithContexts(
        <DetailsSessionPage
          session={sessionOnPeutSAutoinscrire}
          beneficiairesStructureMilo={[]}
          returnTo='whatever'
        />
      )
      const toggleAutoinscription = getToggleAutoinscriptionSession()

      // Then
      expect(toggleAutoinscription).toBeChecked()
    })

    describe('au clic sur le switch', () => {
      it('change la possibilité de s’autoinscrire et la visibilité', async () => {
        // Given
        ;(changerVisibiliteSession as jest.Mock).mockResolvedValue(undefined)
        await renderWithContexts(
          <DetailsSessionPage
            session={sessionOnPeutPasSAutoinscrire}
            beneficiairesStructureMilo={[]}
            returnTo='whatever'
          />
        )
        const toggleAutoinscription = getToggleAutoinscriptionSession()
        const toggleVisibilite = getToggleVisibiliteSession()

        // When
        await userEvent.click(toggleAutoinscription)

        // Then
        expect(changerAutoinscriptionSession).toHaveBeenCalledWith(
          'session-1',
          true
        )
        expect(toggleAutoinscription).toBeChecked()
        expect(toggleVisibilite).toBeChecked()
      })
    })
  })

  describe('permet de gérer la liste des inscrits', () => {
    let beneficaires: BeneficiaireEtablissement[]
    beforeEach(async () => {
      // Given
      beneficaires = [
        {
          base: uneBaseBeneficiaire({
            id: 'id-beneficiaire-1',
            prenom: 'Harry',
            nom: 'Beau',
          }),
          referent: {
            id: 'id-conseiller-1',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
        {
          base: uneBaseBeneficiaire({
            id: 'id-beneficiaire-2',
            prenom: 'Octo',
            nom: 'Puce',
          }),
          referent: {
            id: 'id-conseiller-1',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
        {
          base: uneBaseBeneficiaire({
            id: 'id-beneficiaire-3',
            prenom: 'Maggy',
            nom: 'Carpe',
          }),
          referent: {
            id: 'id-conseiller-1',
            nom: 'Le Calamar',
            prenom: 'Carlo',
          },
          situation: CategorieSituation.EMPLOI,
          dateDerniereActivite: '2023-03-01T14:11:38.040Z',
        },
        {
          base: uneBaseBeneficiaire({
            id: 'id-beneficiaire-4',
            prenom: 'Tom',
            nom: 'Sawyer',
          }),
          referent: {
            id: 'id-conseiller-1',
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
        const session = unDetailSession({
          session: {
            ...unDetailSession().session,
            dateMaxInscription: DateTime.now().plus({ days: 1 }).toString(),
          },
          inscriptions: [
            {
              idJeune: 'id-beneficiaire-3',
              nom: 'Carpe',
              prenom: 'Maggy',
              statut: 'REFUS_JEUNE',
            },
            {
              idJeune: 'id-beneficiaire-2',
              nom: 'Puce',
              prenom: 'Octo',
              statut: 'REFUS_TIERS',
            },
            {
              idJeune: 'id-beneficiaire-1',
              nom: 'Beau',
              prenom: 'Harry',
              statut: 'INSCRIT',
            },
          ],
        })

        await renderWithContexts(
          <DetailsSessionPage
            session={session}
            beneficiairesStructureMilo={beneficaires}
            returnTo='whatever'
          />
        )
      })

      it('affiche la liste des inscrits', () => {
        // Given
        const listeInscrits = within(
          screen.getByRole('list', {
            name: 'Bénéficiaires inscrits',
          })
        ).getAllByRole('listitem')

        // Then
        expect(
          within(listeInscrits[0]).getByText('Maggy Carpe')
        ).toBeInTheDocument()
        expect(
          within(listeInscrits[0]).getByText('Refus jeune')
        ).toBeInTheDocument()
        expect(
          within(listeInscrits[1]).getByText('Refus tiers')
        ).toBeInTheDocument()
        expect(
          within(listeInscrits[2]).getByText('Inscrit')
        ).toBeInTheDocument()
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
        ;(useRouter as jest.Mock).mockReturnValue({
          push: jest.fn(),
          refresh: jest.fn(),
        })
        ;(changerInscriptionsSession as jest.Mock).mockResolvedValue(undefined)

        const session = unDetailSession({
          session: {
            ...unDetailSession().session,
            dateMaxInscription: DateTime.now().plus({ days: 1 }).toString(),
          },
          inscriptions: [
            {
              idJeune: 'id-beneficiaire-1',
              nom: 'Beau',
              prenom: 'Harry',
              statut: 'INSCRIT',
            },
          ],
        })

        await renderWithContexts(
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
          {
            commentaire: undefined,
            idJeune: 'id-beneficiaire-2',
            statut: 'INSCRIT',
          },
          {
            commentaire: undefined,
            idJeune: 'id-beneficiaire-1',
            statut: 'INSCRIT',
          },
        ])
      })
    })
  })

  describe('si la date limite d’inscription est dépassée', () => {
    beforeEach(async () => {
      // Given
      const session = unDetailSession({
        session: {
          ...unDetailSession().session,
          dateMaxInscription: DateTime.now().minus({ days: 1 }).toString(),
        },
      })

      ;({ container } = await renderWithContexts(
        <DetailsSessionPage
          session={session}
          beneficiairesStructureMilo={[]}
          returnTo='whatever'
        />
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
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
    beforeEach(async () => {
      // Given
      const session = unDetailSession({
        session: {
          ...unDetailSession().session,
          dateHeureDebut: DateTime.now().minus({ days: 1 }).toString(),
        },
      })

      ;({ container } = await renderWithContexts(
        <DetailsSessionPage
          session={session}
          beneficiairesStructureMilo={[]}
          returnTo='whatever'
        />
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
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
    beforeEach(async () => {
      const session = unDetailSession({
        session: {
          ...unDetailSession().session,
          dateMaxInscription: DateTime.now().plus({ days: 1 }).toString(),
        },
        inscriptions: [
          {
            idJeune: 'id-beneficiaire-2',
            prenom: 'Octo',
            nom: 'Puce',
            statut: 'INSCRIT',
          },
        ],
      })

      await renderWithContexts(
        <DetailsSessionPage
          session={session}
          beneficiairesStructureMilo={[]}
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

  describe('permet de réinscrire un bénéficiaire', () => {
    //Given
    let session: Session

    beforeEach(async () => {
      session = unDetailSession({
        session: {
          ...unDetailSession().session,
          dateMaxInscription: DateTime.now().plus({ days: 1 }).toString(),
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

      await renderWithContexts(
        <DetailsSessionPage
          session={session}
          beneficiairesStructureMilo={[]}
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
      ;(useRouter as jest.Mock).mockReturnValue({
        push: jest.fn(),
        refresh: jest.fn(),
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
        // Given
        const session = unDetailSession({
          session: {
            ...unDetailSession().session,
            statut: 'AVenir',
          },
        })

        await renderWithContexts(
          <DetailsSessionPage
            session={session}
            beneficiairesStructureMilo={[]}
            returnTo='whatever'
          />
        )

        // Then
        expect(
          screen.queryByRole('link', {
            name: 'Clore',
          })
        ).not.toBeInTheDocument()
      })
    })

    describe('quand la session est à clore', () => {
      beforeEach(async () => {
        // Given
        const session = unDetailSession({
          session: {
            ...unDetailSession().session,
            statut: 'AClore',
          },
        })
        ;({ container } = await renderWithContexts(
          <DetailsSessionPage
            session={session}
            beneficiairesStructureMilo={[]}
            returnTo='whatever'
          />
        ))
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
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
          `/agenda/sessions/session-1/cloture?redirectUrl=whatever`
        )
      })
    })
  })
})

function getToggleVisibiliteSession() {
  return within(getEtapeConfiguration()).getByRole('switch', {
    name: /Rendre visible la session/,
  })
}

function getToggleAutoinscriptionSession() {
  return within(getEtapeConfiguration()).getByRole('switch', {
    name: /Les bénéficiaires peuvent s’inscrire en autonomie/,
  })
}

function getEtapeConfiguration() {
  return screen.getByRole('group', {
    name: 'Étape 1: Configurez la session',
  })
}
