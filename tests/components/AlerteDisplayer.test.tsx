import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ID_CONTENU } from 'components/globals'
import AlerteDisplayer from 'components/layouts/AlerteDisplayer'
import { unConseiller } from 'fixtures/conseiller'
import { structureFTCej, structureMilo } from 'interfaces/structure'
import { AlerteParam } from 'referentiel/alerteParam'
import renderWithContexts from 'tests/renderWithContexts'

describe('AlerteDisplayer', () => {
  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  beforeEach(() => {
    alerteSetter = jest.fn()
  })

  describe('quand la création de rdv est réussie', () => {
    beforeEach(async () => {
      // When
      await renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          value: {
            key: AlerteParam.creationRDV,
            target: 'id-rdv',
          },
          setter: alerteSetter,
        },
      })
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/Le rendez-vous a bien été créé/)
      ).toBeInTheDocument()
    })

    it("permet d'accéder à la fiche du rendez-vous", async () => {
      // When
      const lienEvenement = screen.getByRole('link', {
        name: 'Voir le détail du rendez-vous',
      })

      // Then
      expect(lienEvenement).toHaveAttribute(
        'href',
        '/mes-jeunes/edition-rdv?idRdv=id-rdv'
      )
    })
  })

  describe('quand la modification de rdv est réussie', () => {
    it("affiche l'alerte de succès", async () => {
      await renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          value: {
            key: AlerteParam.modificationRDV,
          },
          setter: alerteSetter,
        },
      })

      // Then
      expect(
        screen.getByText(/Le rendez-vous a bien été modifié/)
      ).toBeInTheDocument()
    })
  })

  describe('quand la suppression de rdv est réussie', () => {
    it("affiche l'alerte de succès", async () => {
      // Given
      await renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          value: {
            key: AlerteParam.suppressionRDV,
          },
          setter: alerteSetter,
        },
      })

      // Then
      expect(
        screen.getByText(/Le rendez-vous a bien été supprimé/)
      ).toBeInTheDocument()
    })
  })

  describe('quand la création d’une animation collective est réussie', () => {
    beforeEach(async () => {
      // When
      await renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          value: {
            key: AlerteParam.creationAnimationCollective,
            target: 'id-ac',
          },
          setter: alerteSetter,
        },
      })
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/L’animation collective a bien été créée/)
      ).toBeInTheDocument()
    })

    it("permet d'accéder à la fiche de l’animation collective", async () => {
      // When
      const lienEvenement = screen.getByRole('link', {
        name: 'Voir le détail de l’animation collective',
      })

      // Then
      expect(lienEvenement).toHaveAttribute(
        'href',
        '/mes-jeunes/edition-rdv?idRdv=id-ac'
      )
    })
  })

  describe('quand la modification d’une animation collective est réussie', () => {
    it("affiche l'alerte de succès", async () => {
      await renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          value: {
            key: AlerteParam.modificationAnimationCollective,
          },
          setter: alerteSetter,
        },
      })

      // Then
      expect(
        screen.getByText(/L’animation collective a bien été modifiée/)
      ).toBeInTheDocument()
    })
  })

  describe('quand la suppression d’une animation collective est réussie', () => {
    it("affiche l'alerte de succès", async () => {
      // Given
      await renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          value: {
            key: AlerteParam.suppressionAnimationCollective,
          },
          setter: alerteSetter,
        },
      })

      // Then
      expect(
        screen.getByText(/L’animation collective a bien été supprimée/)
      ).toBeInTheDocument()
    })
  })

  describe('quand on vient de récupérer des bénéficiaires', () => {
    it("affiche l'alerte de succès", async () => {
      // Given
      await renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          value: {
            key: AlerteParam.recuperationBeneficiaires,
          },
          setter: alerteSetter,
        },
      })

      // Then
      expect(
        screen.getByText(/Vous avez récupéré vos bénéficiaires avec succès/)
      ).toBeInTheDocument()
    })
  })

  describe('quand la création d’un jeune est réussie', () => {
    beforeEach(async () => {
      // Given
      await renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          value: {
            key: AlerteParam.creationBeneficiaire,
            target: 'id-beneficiaire',
          },
          setter: alerteSetter,
        },
      })
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/Le bénéficiaire a été ajouté à votre portefeuille/)
      ).toBeInTheDocument()
    })

    it("permet d'accéder à la fiche du jeune", async () => {
      // When
      const lienFicheJeune = screen.getByRole('link', {
        name: 'Voir le détail du bénéficiaire',
      })

      // Then
      expect(lienFicheJeune).toBeInTheDocument()
      expect(lienFicheJeune).toHaveAttribute(
        'href',
        '/mes-jeunes/id-beneficiaire'
      )
    })
  })

  describe('quand l’ajout ou la modification de l’identifiant partenaire est réussi', () => {
    it("affiche l'alerte de succès", async () => {
      // Given
      await renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          value: {
            key: AlerteParam.modificationIdentifiantPartenaire,
          },
          setter: alerteSetter,
        },
      })

      // Then
      expect(
        screen.getByText(/L’identifiant France Travail a bien été mis à jour/)
      ).toBeInTheDocument()
    })
  })

  describe('envoie de message multi-destinataire', () => {
    it("affiche l'alerte de succès", async () => {
      // Given
      await renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          value: {
            key: AlerteParam.envoiMessage,
          },
          setter: alerteSetter,
        },
      })

      // Then
      expect(
        screen.getByText(/Votre message multi-destinataires/)
      ).toBeInTheDocument()
    })
  })

  describe('quand on renseigne une agence Milo', () => {
    it("affiche l'alerte de succès", async () => {
      // Given
      await renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          value: {
            key: AlerteParam.choixAgence,
          },
          setter: alerteSetter,
        },
        customConseiller: unConseiller({
          structure: structureMilo,
        }),
      })

      // Then
      expect(screen.getByText(/Votre Mission Locale/)).toBeInTheDocument()
    })
  })

  describe('quand on renseigne une agence France Travail', () => {
    it("affiche l'alerte de succès", async () => {
      await renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          value: {
            key: AlerteParam.choixAgence,
          },
          setter: alerteSetter,
        },
        customConseiller: unConseiller({
          structure: structureFTCej,
        }),
      })

      // Then
      expect(screen.getByText(/Votre agence/)).toBeInTheDocument()
    })
  })

  describe('quand on crée une liste', () => {
    it("affiche l'alerte de succès", async () => {
      await renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          value: {
            key: AlerteParam.creationListe,
          },
          setter: alerteSetter,
        },
        customConseiller: unConseiller({
          structure: structureFTCej,
        }),
      })

      // Then
      expect(screen.getByText(/La liste a bien été créée/)).toBeInTheDocument()
    })
  })

  describe('quand on modifie une liste', () => {
    it("affiche l'alerte de succès", async () => {
      // Given - When
      await renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          value: {
            key: AlerteParam.modificationListe,
          },
          setter: alerteSetter,
        },
        customConseiller: unConseiller({
          structure: structureFTCej,
        }),
      })

      // Then
      expect(
        screen.getByText(/La liste a bien été modifiée/)
      ).toBeInTheDocument()
    })
  })

  describe('quand on supprime une liste', () => {
    it("affiche l'alerte de succès", async () => {
      // Given - When
      await renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          value: {
            key: AlerteParam.suppressionListe,
          },
          setter: alerteSetter,
        },
        customConseiller: unConseiller({
          structure: structureFTCej,
        }),
      })

      // Then
      expect(
        screen.getByText(/La liste a bien été supprimée/)
      ).toBeInTheDocument()
    })
  })

  it("permet de fermer l'alerte du succès", async () => {
    // Given
    await renderWithContexts(
      <>
        <div id={ID_CONTENU}></div>
        <AlerteDisplayer />
      </>,
      {
        customAlerte: {
          value: {
            key: AlerteParam.creationRDV,
          },
          setter: alerteSetter,
        },
        customConseiller: unConseiller({
          structure: structureFTCej,
        }),
      }
    )

    // When
    await userEvent.click(screen.getByRole('button', { name: "J'ai compris" }))

    // Then
    expect(alerteSetter).toHaveBeenCalledWith(undefined)
  })
})
