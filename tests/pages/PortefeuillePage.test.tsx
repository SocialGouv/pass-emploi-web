import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import React from 'react'

import PortefeuillePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/PortefeuillePage'
import {
  desBeneficiairesAvecActionsNonTerminees,
  unBeneficiaireAvecActionsNonTerminees,
} from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import {
  BeneficiaireAvecCompteursActionsRdvs,
  CategorieSituation,
} from 'interfaces/beneficiaire'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import { AlerteParam } from 'referentiel/alerteParam'
import { recupererBeneficiaires } from 'services/beneficiaires.service'
import { countMessagesNotRead, signIn } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'
import { toLongMonthDate, toShortDate } from 'utils/date'

jest.mock('services/messages.service')
jest.mock('services/beneficiaires.service')
jest.mock('components/PageActionsPortal')

describe('PortefeuillePage client side', () => {
  let container: HTMLElement
  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  let refresh: jest.Mock
  const jeunes = desBeneficiairesAvecActionsNonTerminees()
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
        ;({ container } = renderWithContexts(
          <PortefeuillePage conseillerJeunes={jeunes} isFromEmail />
        ))
      })
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it("affiche la liste des bénéficiaires s'il en a", async () => {
      //THEN
      expect(screen.getAllByRole('row')).toHaveLength(jeunes.length + 1)
      jeunes.forEach((jeune) => {
        expect(screen.getByText(jeune.actionsCreees)).toBeInTheDocument()
      })

      expect(() =>
        screen.getByText("Vous n'avez pas encore intégré de bénéficiaires.")
      ).toThrow()
      expect(() => screen.getByText(/transférés temporairement/)).toThrow()
    })

    it('affiche la date de fin du CEJ', () => {
      jeunes.forEach((jeune) => {
        const nomBeneficiaire = `${jeune.nom} ${jeune.prenom}`
        const row = within(
          screen.getByRole('cell', { name: new RegExp(nomBeneficiaire) })
            .parentElement!
        )

        if (jeune.dateFinCEJ)
          expect(
            row.getByText(toLongMonthDate(DateTime.fromISO(jeune.dateFinCEJ)))
          ).toBeInTheDocument()
        else
          expect(
            row.getByText('information non disponible')
          ).toBeInTheDocument()
      })
    })

    describe("affiche le statut d'activation du compte d'un jeune", () => {
      it("si le compte n'a pas été activé", () => {
        const row = screen.getByRole('cell', {
          name: 'Sanfamiye Nadia Sans situation',
        }).parentElement!

        //THEN
        expect(
          within(row).getByRole('cell', { name: 'Compte non activé' })
        ).toBeInTheDocument()
      })

      it('si le compte a été activé', () => {
        const row = screen.getByRole('cell', {
          name: 'Jirac Kenji Sans situation',
        }).parentElement!

        //THEN
        expect(
          within(row).getByRole('cell', { name: 'Le 07/12/2021 à 18h30' })
        ).toBeInTheDocument()
      })
    })

    describe("affiche la réaffectation temporaire d'un jeune", () => {
      it('si le compte a été réaffecté temporairement', () => {
        expect(
          screen.getByRole('cell', {
            name: "bénéficiaire temporaire D'Aböville-Muñoz François Maria Sans situation",
          })
        ).toBeInTheDocument()
      })

      it("si le compte n'a pas été réaffecté temporairement", () => {
        const row = screen.getByRole('cell', {
          name: 'Sanfamiye Nadia Sans situation',
        }).parentElement!

        //THEN
        expect(() => within(row).getByText(/bénéficiaire temporaire/)).toThrow()
      })
    })

    it('masque le header du tableau', () => {
      expect(screen.getAllByRole('rowgroup')[0]).toHaveAttribute(
        'class',
        'sr-only'
      )
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
            customAlerte: { setter: alerteSetter },
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
    let jeune: BeneficiaireAvecCompteursActionsRdvs
    let beneficiaireAvecStructureDifferente: BeneficiaireAvecCompteursActionsRdvs
    jest.spyOn(DateTime, 'now').mockReturnValue(DateTime.fromISO('2024-01-01'))

    beforeEach(async () => {
      //GIVEN
      jeune = unBeneficiaireAvecActionsNonTerminees({
        situationCourante: CategorieSituation.DEMANDEUR_D_EMPLOI,
      })
      beneficiaireAvecStructureDifferente =
        unBeneficiaireAvecActionsNonTerminees({
          prenom: 'Aline',
          id: 'beneficiaire-2',
          structureMilo: { id: '2' },
        })

      await act(async () => {
        ;({ container } = renderWithContexts(
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
        ))
      })
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('permer de créer un jeune MILO', async () => {
      //THEN
      expect(
        screen.getByRole('link', {
          name: 'Ajouter un bénéficiaire',
        })
      ).toHaveAttribute('href', '/mes-jeunes/creation-jeune')
    })

    it('affiche la période en cours', () => {
      const DEBUT_PERIODE = toShortDate(DateTime.now().startOf('week'))
      const FIN_PERIODE = toShortDate(DateTime.now().endOf('week'))

      expect(
        screen.getByText(`Semaine du ${DEBUT_PERIODE} au ${FIN_PERIODE}`)
      ).toBeInTheDocument()
    })

    it("affiche la colonne nombre d'actions des bénéficiaires", () => {
      // Then
      expect(
        screen.getByRole('columnheader', { name: /Actions/ })
      ).toBeInTheDocument()
    })

    it('affiche la colonne nombre de rendez-vous des bénéficiaires', () => {
      // Then
      expect(
        screen.getByRole('columnheader', { name: 'RDV et ateliers' })
      ).toBeInTheDocument()
    })

    it('affiche si la structure du bénéficiaire est différente', () => {
      //THEN
      expect(
        screen.getByRole('cell', {
          name: /Ce bénéficiaire est rattaché à une Mission Locale différente de la vôtre. Jirac Kenji/,
        }).parentElement!
      ).toBeInTheDocument()
    })
  })

  describe('quand le conseiller est France Travail', () => {
    beforeEach(async () => {
      //GIVEN
      const jeune = unBeneficiaireAvecActionsNonTerminees()

      await act(async () => {
        ;({ container } = renderWithContexts(
          <PortefeuillePage conseillerJeunes={[jeune]} isFromEmail />,
          {
            customConseiller: { structure: StructureConseiller.POLE_EMPLOI },
          }
        ))
      })
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('permer de créer un jeune FT', async () => {
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

  describe('quand le conseiller est un conseiller département', () => {
    beforeEach(async () => {
      //GIVEN
      const jeune = unBeneficiaireAvecActionsNonTerminees()

      await act(async () => {
        ;({ container } = renderWithContexts(
          <PortefeuillePage conseillerJeunes={[jeune]} isFromEmail />,
          {
            customConseiller: { structure: StructureConseiller.CONSEIL_DEPT },
          }
        ))
      })
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('permer de créer un jeune FT', async () => {
      //THEN
      expect(
        screen.getByRole('link', {
          name: 'Ajouter un bénéficiaire',
        })
      ).toHaveAttribute('href', '/mes-jeunes/creation-jeune')
    })

    it('n’affiche pas le nombre de démarche créés dans la semaine par les bénéficiaires', () => {
      // Then
      expect(() =>
        screen.getByRole('columnheader', { name: 'Démarches créées' })
      ).toThrow()
    })

    it('affiche le nombre de messages non lus', () => {
      // Then
      expect(
        screen.getByRole('columnheader', {
          name: 'Messages non lus par le béneficiaire',
        })
      ).toBeInTheDocument()
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
