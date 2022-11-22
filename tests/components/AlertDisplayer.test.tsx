import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'

import AlertDisplayer from 'components/layouts/AlertDisplayer'
import { unConseiller } from 'fixtures/conseiller'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'

describe('AlertDisplayer', () => {
  describe('quand la création de rdv est réussie', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/agenda',
        query: { creationRdv: 'succes', idEvenement: 'id-evenement' },
        push: routerPush,
      })

      // When
      renderAlertDisplayer()
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

    it("permet de fermer l'alerte du succès", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: "J'ai compris" })
      )

      // Then
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/agenda',
          query: {},
        },
        undefined,
        { shallow: true }
      )
    })
  })

  describe('quand la création d’une animation collective est réussie', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/agenda',
        query: { creationAC: 'succes', idEvenement: 'id-evenement' },
        push: routerPush,
      })

      // When
      renderAlertDisplayer()
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/L’animation collective a bien été créée/)
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

    it("permet de fermer l'alerte du succès", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: "J'ai compris" })
      )

      // Then
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/agenda',
          query: {},
        },
        undefined,
        { shallow: true }
      )
    })
  })

  describe('quand la modification de rdv est réussie', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/agenda',
        query: { modificationRdv: 'succes' },
        push: routerPush,
      })

      // When
      renderAlertDisplayer()
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/événement a bien été modifié/)
      ).toBeInTheDocument()
    })

    it("permet de fermer l'alerte du succès", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: "J'ai compris" })
      )

      // Then
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/agenda',
          query: {},
        },
        undefined,
        { shallow: true }
      )
    })
  })

  describe('quand la modification de l’animation collective est réussie', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/agenda',
        query: { modificationAC: 'succes' },
        push: routerPush,
      })

      // When
      renderAlertDisplayer()
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/animation collective a bien été modifié/)
      ).toBeInTheDocument()
    })

    it("permet de fermer l'alerte du succès", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: "J'ai compris" })
      )

      // Then
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/agenda',
          query: {},
        },
        undefined,
        { shallow: true }
      )
    })
  })

  describe('quand la suppression de rdv est réussie', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/agenda',
        query: { suppressionRdv: 'succes' },
        push: routerPush,
      })

      // When
      renderAlertDisplayer()
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/événement a bien été supprimé/)
      ).toBeInTheDocument()
    })

    it("permet de fermer l'alerte du succès", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: "J'ai compris" })
      )

      // Then
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/agenda',
          query: {},
        },
        undefined,
        { shallow: true }
      )
    })
  })

  describe('quand la suppression de l’animation collective est réussie', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/agenda',
        query: { suppressionAC: 'succes' },
        push: routerPush,
      })

      // When
      renderAlertDisplayer()
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/animation collective a bien été supprimé/)
      ).toBeInTheDocument()
    })

    it("permet de fermer l'alerte du succès", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: "J'ai compris" })
      )

      // Then
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/agenda',
          query: {},
        },
        undefined,
        { shallow: true }
      )
    })
  })

  describe('quand on vient de récupérer des bénéficiaires', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/mes-jeunes',
        query: { recuperation: 'succes' },
        push: routerPush,
      })

      // When
      renderAlertDisplayer()
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/Vous avez récupéré vos bénéficiaires avec succès/)
      ).toBeInTheDocument()
    })

    it("permet de fermer l'alerte du succès", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: "J'ai compris" })
      )

      // Then
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/mes-jeunes',
          query: {},
        },
        undefined,
        { shallow: true }
      )
    })
  })

  describe('quand la création d’un jeune est réussie', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/mes-jeunes',
        query: { creationBeneficiaire: 'succes', idBeneficiaire: 'id' },
        push: routerPush,
      })

      // When
      renderAlertDisplayer()
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
      expect(lienFicheJeune).toHaveAttribute('href', '/mes-jeunes/id')
    })

    it("permet de fermer l'alerte du succès", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: "J'ai compris" })
      )

      // Then
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/mes-jeunes',
          query: {},
        },
        undefined,
        { shallow: true }
      )
    })
  })

  describe('quand on vient de supprimer un jeune', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/mes-jeunes',
        query: { suppression: 'succes' },
        push: routerPush,
      })

      // When
      renderAlertDisplayer()
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/compte du bénéficiaire a bien été supprimé/)
      ).toBeInTheDocument()
    })

    it("permet de fermer l'alerte du succès", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: "J'ai compris" })
      )

      // Then
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/mes-jeunes',
          query: {},
        },
        undefined,
        { shallow: true }
      )
    })
  })

  describe('quand la création d’une action est réussie', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/mes-jeunes/jeune-1',
        query: { creationAction: 'succes' },
        push: routerPush,
      })

      // When
      renderAlertDisplayer()
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(screen.getByText(/L’action a bien été créée/)).toBeInTheDocument()
    })

    it("permet de fermer l'alerte du succès", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: "J'ai compris" })
      )

      // Then
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/mes-jeunes/jeune-1',
          query: {},
        },
        undefined,
        { shallow: true }
      )
    })
  })

  describe('quand l’ajout ou la modification de l’identifiant partenaire est réussi', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/mes-jeunes/jeune-1',
        query: { modificationIdentifiantPartenaire: 'succes' },
        push: routerPush,
      })

      // When
      renderAlertDisplayer()
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/L’identifiant Pôle emploi a bien été mis à jour/)
      ).toBeInTheDocument()
    })

    it("permet de fermer l'alerte du succès", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: "J'ai compris" })
      )

      // Then
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/mes-jeunes/jeune-1',
          query: {},
        },
        undefined,
        { shallow: true }
      )
    })
  })

  describe('envoie de message multi-destinataire', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/mes-jeunes',
        query: { envoiMessage: 'succes' },
        push: routerPush,
      })

      // When
      renderAlertDisplayer()
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/Votre message multi-destinataires/)
      ).toBeInTheDocument()
    })

    it("permet de fermer l'alerte du succès", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: "J'ai compris" })
      )

      // Then
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/mes-jeunes',
          query: {},
        },
        undefined,
        { shallow: true }
      )
    })
  })

  describe('quand on renseigne une agence Milo', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/mes-jeunes',
        query: { choixAgence: 'succes' },
        push: routerPush,
      })

      // When
      const conseillerMilo = unConseiller({
        structure: StructureConseiller.MILO,
      })
      renderAlertDisplayer(conseillerMilo)
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(screen.getByText(/Votre Mission locale/)).toBeInTheDocument()
    })

    it("permet de fermer l'alerte du succès", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: "J'ai compris" })
      )

      // Then
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/mes-jeunes',
          query: {},
        },
        undefined,
        { shallow: true }
      )
    })
  })

  describe('quand on renseigne une agence Pole emploi', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/mes-jeunes',
        query: { choixAgence: 'succes' },
        push: routerPush,
      })

      // When
      const conseillerPoleEmploi = unConseiller({
        structure: StructureConseiller.POLE_EMPLOI,
      })
      renderAlertDisplayer(conseillerPoleEmploi)
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(screen.getByText(/Votre agence/)).toBeInTheDocument()
    })

    it("permet de fermer l'alerte du succès", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: "J'ai compris" })
      )

      // Then
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/mes-jeunes',
          query: {},
        },
        undefined,
        { shallow: true }
      )
    })
  })
})

function renderAlertDisplayer(conseiller?: Conseiller) {
  return render(
    <ConseillerProvider conseiller={conseiller ?? unConseiller()}>
      <AlertDisplayer />
    </ConseillerProvider>
  )
}
