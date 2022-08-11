import { render, screen } from '@testing-library/react'
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
        asPath: '/mes-rendezvous?creationRdv=succes',
        query: { creationRdv: 'succes' },
        push: routerPush,
      })

      // When
      renderAlertDisplayer()
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/Le rendez-vous a bien été créé/)
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
          pathname: '/mes-rendezvous',
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
        asPath: '/mes-rendezvous?modificationRdv=succes',
        query: { modificationRdv: 'succes' },
        push: routerPush,
      })

      // When
      renderAlertDisplayer()
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/rendez-vous a bien été modifié/)
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
          pathname: '/mes-rendezvous',
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
        asPath: '/mes-rendezvous?suppressionRdv=succes',
        query: { suppressionRdv: 'succes' },
        push: routerPush,
      })

      // When
      renderAlertDisplayer()
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/rendez-vous a bien été supprimé/)
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
          pathname: '/mes-rendezvous',
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
        asPath: '/mes-jeunes?recuperation=succes',
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
        name: 'voir le détail du bénéficiaire',
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
        asPath: '/mes-jeunes?suppression=succes',
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
        asPath: '/mes-jeunes/jeune-1?creationAction=succes',
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

  describe('envoie de message multi-destinataire', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/mes-jeunes?envoiMessage=succes',
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
        asPath: '/mes-jeunes?choixAgence=succes',
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
        asPath: '/mes-jeunes?choixAgence=succes',
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
