import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import React from 'react'

import PortefeuillePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/PortefeuillePage'
import { unConseiller } from 'fixtures/conseiller'
import {
  desJeunesAvecActionsNonTerminees,
  unJeuneAvecActionsNonTerminees,
} from 'fixtures/jeune'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import {
  CategorieSituation,
  JeuneAvecNbActionsNonTerminees,
} from 'interfaces/jeune'
import { AlerteParam } from 'referentiel/alerteParam'
import { recupererBeneficiaires } from 'services/conseiller.service'
import { countMessagesNotRead, signIn } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/messages.service')
jest.mock('services/conseiller.service')
jest.mock('components/PageActionsPortal')

describe('PortefeuillePage client side', () => {
  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  let refresh: jest.Mock
  const jeunes = desJeunesAvecActionsNonTerminees()
  beforeEach(() => {
    alerteSetter = jest.fn()
    refresh = jest.fn(() => Promise.resolve())
    ;(signIn as jest.Mock).mockResolvedValue(undefined)
    ;(countMessagesNotRead as jest.Mock).mockImplementation((ids: string[]) =>
      Promise.resolve(
        ids.reduce(
          (mapped, id) => ({ ...mapped, [id]: 2 }),
          {} as { [id: string]: number }
        )
      )
    )
  })

  describe('Contenu de page', () => {
    beforeEach(async () => {
      // WHEN
      await act(async () => {
        renderWithContexts(
          <PortefeuillePage conseillerJeunes={jeunes} isFromEmail />
        )
      })
    })

    it("affiche la liste des bénéficiaires s'il en a", async () => {
      //THEN
      expect(screen.getAllByRole('row')).toHaveLength(jeunes.length + 1)
      jeunes.forEach((jeune) => {
        expect(
          screen.getByText(jeune.nbActionsNonTerminees)
        ).toBeInTheDocument()
      })
      expect(screen.getAllByText('2')).toHaveLength(jeunes.length)

      expect(() =>
        screen.getByText("Vous n'avez pas encore intégré de bénéficiaires.")
      ).toThrow()
      expect(() => screen.getByText(/transférés temporairement/)).toThrow()
    })

    describe("affiche le statut d'activation du compte d'un jeune", () => {
      it("si le compte n'a pas été activé", () => {
        const row2 = within(
          screen
            .getByText('Sanfamiye Nadia')
            .closest('[role="row"]') as HTMLElement
        )

        //THEN
        expect(row2.getByText('Compte non activé')).toBeInTheDocument()
      })

      it('si le compte a été activé', () => {
        const row1 = within(
          screen.getByText('Jirac Kenji').closest('[role="row"]') as HTMLElement
        )

        //THEN
        expect(row1.getByText('Le 07/12/2021 à 18h30')).toBeInTheDocument()
      })
    })

    describe("affiche la réaffectation temporaire d'un jeune", () => {
      it('si le compte a été réaffecté temporairement', () => {
        const row3 = within(
          screen.getByText(/Maria/).closest('[role="row"]') as HTMLElement
        )

        //THEN
        expect(
          row3.getByLabelText('bénéficiaire temporaire')
        ).toBeInTheDocument()
      })

      it("si le compte n'a pas été réaffecté temporairement", () => {
        const row2 = within(
          screen
            .getByText('Sanfamiye Nadia')
            .closest('[role="row"]') as HTMLElement
        )

        //THEN
        expect(() => row2.getByText('bénéficiaire temporaire')).toThrow()
      })
    })
  })

  describe('quand le conseiller a des bénéficiaires à récupérer', () => {
    let conseiller: Conseiller
    beforeEach(async () => {
      // Given
      ;(useRouter as jest.Mock).mockReturnValue({
        refresh: refresh,
      })

      await act(async () => {
        conseiller = unConseiller({ aDesBeneficiairesARecuperer: true })
        renderWithContexts(
          <PortefeuillePage conseillerJeunes={jeunes} isFromEmail />,
          {
            customConseiller: conseiller,
            customAlerte: { alerteSetter },
          }
        )
      })
    })

    it('affiche un message d’information', () => {
      // Then
      expect(
        screen.getByText(
          'Certains de vos bénéficiaires ont été transférés temporairement.'
        )
      ).toBeInTheDocument()
    })

    it('permet de récupérer les bénéficiaires', async () => {
      // Given
      const boutonRecuperationBeneficiaires = screen.getByRole('button', {
        name: 'Récupérer ces bénéficiaires',
      })

      // When
      await userEvent.click(boutonRecuperationBeneficiaires)

      // Then
      expect(recupererBeneficiaires).toHaveBeenCalledWith()
      expect(alerteSetter).toHaveBeenCalledWith('recuperationBeneficiaires')
      expect(refresh).toHaveBeenCalled()
    })
  })

  describe('quand le conseiller est MILO', () => {
    let jeune: JeuneAvecNbActionsNonTerminees
    let beneficiaireAvecStructureDifferente: JeuneAvecNbActionsNonTerminees

    beforeEach(async () => {
      //GIVEN
      jeune = unJeuneAvecActionsNonTerminees({
        situationCourante: CategorieSituation.DEMANDEUR_D_EMPLOI,
      })
      beneficiaireAvecStructureDifferente = unJeuneAvecActionsNonTerminees({
        prenom: 'Aline',
        id: 'jeune-2',
        structureMilo: { id: '2' },
      })

      await act(async () => {
        renderWithContexts(
          <PortefeuillePage
            conseillerJeunes={[jeune, beneficiaireAvecStructureDifferente]}
            isFromEmail
          />,
          {
            customConseiller: {
              structure: StructureConseiller.MILO,
              structureMilo: { nom: 'Agence', id: '1' },
            },
          }
        )
      })
    })

    it('permer de créer un jeune MILO', async () => {
      //THEN
      expect(
        screen.getByRole('link', {
          name: 'Ajouter un bénéficiaire',
        })
      ).toHaveAttribute('href', '/mes-jeunes/creation-jeune')
    })

    it("affiche la colonne nombre d'actions des jeunes", () => {
      // Then
      expect(
        screen.getByRole('columnheader', { name: 'Actions' })
      ).toBeInTheDocument()
    })

    it('affiche la colonne situation courante des jeunes', () => {
      // Then
      expect(
        screen.getByRole('columnheader', { name: 'Situation' })
      ).toBeInTheDocument()
    })

    it('affiche la situation courante du jeune', () => {
      expect(screen.getByText(jeune.situationCourante!)).toBeInTheDocument()
    })

    it('affiche si la structure du bénéficiaire est différente', () => {
      const row3 = within(
        screen.getByText(/Kenji/).closest('[role="row"]') as HTMLElement
      )

      //THEN
      expect(
        row3.getByLabelText(
          /Ce bénéficiaire est rattaché à une Mission Locale différente/
        )
      ).toBeInTheDocument()
    })
  })

  describe('quand le conseiller est France Travail', () => {
    beforeEach(async () => {
      //GIVEN
      const jeune = unJeuneAvecActionsNonTerminees()

      await act(async () => {
        renderWithContexts(
          <PortefeuillePage conseillerJeunes={[jeune]} isFromEmail />,
          {
            customConseiller: { structure: StructureConseiller.POLE_EMPLOI },
          }
        )
      })
    })

    it('permer de créer un jeune PE', async () => {
      //THEN
      expect(
        screen.getByRole('link', {
          name: 'Ajouter un bénéficiaire',
        })
      ).toHaveAttribute('href', '/mes-jeunes/creation-jeune')
    })

    it("n'affiche pas le nombre d'actions des jeunes", () => {
      // Then
      expect(() =>
        screen.getByRole('columnheader', { name: 'Actions' })
      ).toThrow()
    })

    it("n'affiche pas la situation courante des jeunes", () => {
      // Then
      expect(() =>
        screen.getByRole('columnheader', { name: 'Situation' })
      ).toThrow()
    })
  })

  describe("quand le conseiller n'a pas de jeune", () => {
    it("n'affiche pas la recherche de jeune", async () => {
      // GIVEN
      await act(async () => {
        renderWithContexts(
          <PortefeuillePage conseillerJeunes={[]} isFromEmail />
        )
      })

      // Then
      expect(() =>
        screen.getByLabelText(
          /Rechercher un bénéficiaire par son nom ou prénom/
        )
      ).toThrow()
    })

    it('affiche un message invitant à ajouter des bénéficiaires', async () => {
      // GIVEN
      await act(async () => {
        renderWithContexts(
          <PortefeuillePage conseillerJeunes={[]} isFromEmail />
        )
      })

      //THEN
      expect(
        screen.getByText(
          'Vous n’avez pas encore de bénéficiaire rattaché à votre portefeuille.'
        )
      ).toBeInTheDocument()
      expect(() => screen.getAllByRole('row')).toThrow()
    })

    describe('quand le conseiller a des bénéficiaires à récupérer', () => {
      beforeEach(async () => {
        // GIVEN
        const conseiller = unConseiller({
          aDesBeneficiairesARecuperer: true,
        })
        await act(async () => {
          renderWithContexts(
            <PortefeuillePage conseillerJeunes={[]} isFromEmail />,
            { customConseiller: conseiller }
          )
        })
      })

      it("n'affiche pas de message invitant à ajouter des bénéficiaires", () => {
        //THEN
        expect(() =>
          screen.getByText("Vous n'avez pas encore intégré de bénéficiaires.")
        ).toThrow()
        expect(() => screen.getAllByRole('row')).toThrow()
      })

      it('permet de recupérer les bénéficiaires', () => {
        expect(
          screen.getByText(/Vos bénéficiaires ont été transférés/)
        ).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: 'Récupérer les bénéficiaires' })
        ).toBeInTheDocument()
      })
    })
  })

  describe('quand la récupération des messages non lus échoue', () => {
    it('affiche la liste des jeunes', async () => {
      // GIVEN
      ;(countMessagesNotRead as jest.Mock).mockRejectedValue(new Error())

      // WHEN
      await act(async () => {
        renderWithContexts(
          <PortefeuillePage conseillerJeunes={jeunes} isFromEmail />
        )
      })

      //THEN
      expect(screen.getAllByRole('row')).toHaveLength(jeunes.length + 1)
    })
  })
})
