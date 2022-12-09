import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import AlerteDisplayer from 'components/layouts/AlerteDisplayer'
import { unConseiller } from 'fixtures/conseiller'
import { StructureConseiller } from 'interfaces/conseiller'
import { AlerteParam } from 'referentiel/alerteParam'
import renderWithContexts from 'tests/renderWithContexts'

describe('AlerteDisplayer', () => {
  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  beforeEach(() => {
    alerteSetter = jest.fn()
  })

  describe('quand la création de rdv est réussie', () => {
    beforeEach(() => {
      // When
      renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          alerte: {
            key: AlerteParam.creationEvenement,
            target: 'id-evenement',
          },
          alerteSetter,
        },
      })
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/L’événement a bien été créé/)
      ).toBeInTheDocument()
    })

    it("permet d'accéder à la fiche de l’événement", async () => {
      // When
      const lienEvenement = screen.getByRole('link', {
        name: 'Voir le détail de l’événement',
      })

      // Then
      expect(lienEvenement).toHaveAttribute(
        'href',
        '/mes-jeunes/edition-rdv?idRdv=id-evenement'
      )
    })
  })

  describe('quand la modification de rdv est réussie', () => {
    it("affiche l'alerte de succès", () => {
      renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          alerte: {
            key: AlerteParam.modificationEvenement,
          },
          alerteSetter,
        },
      })

      // Then
      expect(
        screen.getByText(/événement a bien été modifié/)
      ).toBeInTheDocument()
    })
  })

  describe('quand la suppression de rdv est réussie', () => {
    it("affiche l'alerte de succès", () => {
      // Given
      renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          alerte: {
            key: AlerteParam.suppressionEvenement,
          },
          alerteSetter,
        },
      })

      // Then
      expect(
        screen.getByText(/événement a bien été supprimé/)
      ).toBeInTheDocument()
    })
  })

  describe('quand on vient de récupérer des bénéficiaires', () => {
    it("affiche l'alerte de succès", () => {
      // Given
      renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          alerte: {
            key: AlerteParam.recuperationBeneficiaires,
          },
          alerteSetter,
        },
      })

      // Then
      expect(
        screen.getByText(/Vous avez récupéré vos bénéficiaires avec succès/)
      ).toBeInTheDocument()
    })
  })

  describe('quand la création d’un jeune est réussie', () => {
    beforeEach(() => {
      // Given
      renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          alerte: {
            key: AlerteParam.creationBeneficiaire,
            target: 'id-beneficiaire',
          },
          alerteSetter,
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

  describe('quand on vient de supprimer un jeune', () => {
    it("affiche l'alerte de succès", () => {
      // Given
      renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          alerte: {
            key: AlerteParam.suppressionBeneficiaire,
          },
          alerteSetter,
        },
      })

      // Then
      expect(
        screen.getByText(/compte du bénéficiaire a bien été supprimé/)
      ).toBeInTheDocument()
    })
  })

  describe('quand la création d’une action est réussie', () => {
    it("affiche l'alerte de succès", () => {
      // Given
      renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          alerte: {
            key: AlerteParam.creationAction,
          },
          alerteSetter,
        },
      })

      // Then
      expect(screen.getByText(/L’action a bien été créée/)).toBeInTheDocument()
    })
  })

  describe('quand l’ajout ou la modification de l’identifiant partenaire est réussi', () => {
    it("affiche l'alerte de succès", () => {
      // Given
      renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          alerte: {
            key: AlerteParam.modificationIdentifiantPartenaire,
          },
          alerteSetter,
        },
      })

      // Then
      expect(
        screen.getByText(/L’identifiant Pôle emploi a bien été mis à jour/)
      ).toBeInTheDocument()
    })
  })

  describe('envoie de message multi-destinataire', () => {
    it("affiche l'alerte de succès", () => {
      // Given
      renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          alerte: {
            key: AlerteParam.envoiMessage,
          },
          alerteSetter,
        },
      })

      // Then
      expect(
        screen.getByText(/Votre message multi-destinataires/)
      ).toBeInTheDocument()
    })
  })

  describe('quand on renseigne une agence Milo', () => {
    it("affiche l'alerte de succès", () => {
      // Given
      renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          alerte: {
            key: AlerteParam.choixAgence,
          },
          alerteSetter,
        },
        customConseiller: unConseiller({
          structure: StructureConseiller.MILO,
        }),
      })

      // Then
      expect(screen.getByText(/Votre Mission locale/)).toBeInTheDocument()
    })
  })

  describe('quand on renseigne une agence Pole emploi', () => {
    it("affiche l'alerte de succès", () => {
      renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          alerte: {
            key: AlerteParam.choixAgence,
          },
          alerteSetter,
        },
        customConseiller: unConseiller({
          structure: StructureConseiller.POLE_EMPLOI,
        }),
      })

      // Then
      expect(screen.getByText(/Votre agence/)).toBeInTheDocument()
    })
  })

  describe('quand on crée une liste de diffusion', () => {
    it("affiche l'alerte de succès", () => {
      renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          alerte: {
            key: AlerteParam.creationListeDiffusion,
          },
          alerteSetter,
        },
        customConseiller: unConseiller({
          structure: StructureConseiller.POLE_EMPLOI,
        }),
      })

      // Then
      expect(
        screen.getByText(/La liste de diffusion a bien été créée/)
      ).toBeInTheDocument()
    })
  })

  describe('quand on modifie une liste de diffusion', () => {
    it("affiche l'alerte de succès", () => {
      // Given - When
      renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          alerte: {
            key: AlerteParam.modificationListeDiffusion,
          },
          alerteSetter,
        },
        customConseiller: unConseiller({
          structure: StructureConseiller.POLE_EMPLOI,
        }),
      })

      // Then
      expect(
        screen.getByText(/La liste de diffusion a bien été modifiée/)
      ).toBeInTheDocument()
    })
  })

  describe('quand on supprime une liste de diffusion', () => {
    it("affiche l'alerte de succès", () => {
      // Given - When
      renderWithContexts(<AlerteDisplayer />, {
        customAlerte: {
          alerte: {
            key: AlerteParam.suppressionListeDiffusion,
          },
          alerteSetter,
        },
        customConseiller: unConseiller({
          structure: StructureConseiller.POLE_EMPLOI,
        }),
      })

      // Then
      expect(
        screen.getByText(/La liste de diffusion a bien été supprimée/)
      ).toBeInTheDocument()
    })
  })

  it("permet de fermer l'alerte du succès", async () => {
    // Given
    renderWithContexts(<AlerteDisplayer />, {
      customAlerte: {
        alerte: {
          key: AlerteParam.creationEvenement,
        },
        alerteSetter,
      },
      customConseiller: unConseiller({
        structure: StructureConseiller.POLE_EMPLOI,
      }),
    })

    // When
    await userEvent.click(screen.getByRole('button', { name: "J'ai compris" }))

    // Then
    expect(alerteSetter).toHaveBeenCalledWith(undefined)
  })
})
