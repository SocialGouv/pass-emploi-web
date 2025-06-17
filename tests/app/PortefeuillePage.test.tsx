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
import { Conseiller } from 'interfaces/conseiller'
import { structureFTCej, structureMilo } from 'interfaces/structure'
import { AlerteParam } from 'referentiel/alerteParam'
import { getComptageHeuresPortefeuille } from 'services/beneficiaires.service'
import { recupererBeneficiaires } from 'services/conseiller.service'
import { countMessagesNotRead, signIn } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'
import { toShortDate } from 'utils/date'

jest.mock('services/messages.service')
jest.mock('services/beneficiaires.service')
jest.mock('services/conseiller.service')
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
      ;({ container } = await renderWithContexts(
        <PortefeuillePage conseillerJeunes={jeunes} isFromEmail page={1} />
      ))
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

    it('permet de trier bénéficiaire par nom', async () => {
      //when
      const button = screen.getByRole('button', {
        name: /Trier par nom/i,
      })

      //then
      expect(button).toHaveAttribute(
        'title',
        'Trier par nom ordre alphabétique'
      )

      await userEvent.click(button)

      expect(button).toHaveAttribute(
        'title',
        'Trier par nom ordre alphabétique inversé'
      )
    })

    it('permet de trier bénéficiaire par dernière activité ', async () => {
      //when
      const button = screen.getByRole('button', {
        name: /Trier par dernière activité/i,
      })

      //then
      expect(button).toHaveAttribute(
        'title',
        'Trier par dernière activité ordre chronologique'
      )

      await userEvent.click(button)

      expect(button).toHaveAttribute(
        'title',
        'Trier par dernière activité ordre chronologique'
      )
    })

    describe("affiche le statut d'activation du compte d'un jeune", () => {
      it("si le compte n'a pas été activé", () => {
        const row = screen.getByRole('cell', {
          name: 'Sanfamiye Nadia CEJ Sans situation',
        }).parentElement!

        //THEN
        expect(
          within(row).getByRole('cell', { name: 'Compte non activé' })
        ).toBeInTheDocument()
      })

      it('si le compte a été activé', () => {
        const row = screen.getByRole('cell', {
          name: 'Jirac Kenji CEJ Sans situation',
        }).parentElement!

        //THEN
        expect(
          within(row).getByRole('cell', { name: 'Le 07/12/2021 à 18:30' })
        ).toBeInTheDocument()
      })
    })

    describe("affiche la réaffectation temporaire d'un jeune", () => {
      it('si le compte a été réaffecté temporairement', () => {
        expect(
          screen.getByRole('cell', {
            name: "bénéficiaire temporaire D'Aböville-Muñoz François Maria CEJ Sans situation",
          })
        ).toBeInTheDocument()
      })

      it("si le compte n'a pas été réaffecté temporairement", () => {
        const row = screen.getByRole('cell', {
          name: 'Sanfamiye Nadia CEJ Sans situation',
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
        await renderWithContexts(
          <PortefeuillePage conseillerJeunes={jeunes} isFromEmail page={1} />,
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
    const now = DateTime.fromISO('2025-06-18T13:23:13.600+00:00')
    const beneficiaireAvecStructureDifferente =
      unBeneficiaireAvecActionsNonTerminees({
        prenom: 'Aline',
        id: 'id-beneficiaire-autre-structure',
        structureMilo: { id: '2' },
        dispositif: 'PACEA',
      })

    beforeEach(async () => {
      //GIVEN
      process.env.NEXT_PUBLIC_COMPTAGE_HEURES_EARLY_ADOPTERS =
        'id-structure-meaux'
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
      ;(getComptageHeuresPortefeuille as jest.Mock).mockResolvedValue({
        comptages: [
          { idBeneficiaire: 'id-beneficiaire-1', nbHeuresDeclarees: 15 },
          { idBeneficiaire: 'id-beneficiaire-2', nbHeuresDeclarees: 1 },
          { idBeneficiaire: 'id-beneficiaire-3', nbHeuresDeclarees: 12 },
        ],
        dateDerniereMiseAJour: now.minus({ hour: 1, minute: 5 }).toISO(),
      })
      ;({ container } = await renderWithContexts(
        <PortefeuillePage
          conseillerJeunes={[...jeunes, beneficiaireAvecStructureDifferente]}
          isFromEmail
          page={1}
        />,
        {
          customConseiller: {
            agence: { id: 'id-structure-meaux', nom: 'Agence de Meaux' },
            structure: structureMilo,
            structureMilo: { nom: 'Agence', id: 'id-agence' },
          },
        }
      ))
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

    it('permet de filtrer bénéficiaires par dispositif', async () => {
      // Given
      const buttonFiltres = screen.getByRole('button', {
        name: 'Filtrer par dispositifs',
      })

      // When
      await userEvent.click(buttonFiltres)
      await userEvent.click(screen.getByRole('radio', { name: 'CEJ' }))
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Valider la sélection du dispositif',
        })
      )

      // Then
      let portefeuille = screen.getByRole('table')
      expect(within(portefeuille).getAllByRole('row')).toHaveLength(3 + 1)
      expect(() => within(portefeuille).getByText('PACEA')).toThrow()

      // When
      await userEvent.click(buttonFiltres)
      await userEvent.click(screen.getByRole('radio', { name: 'PACEA' }))
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Valider la sélection du dispositif',
        })
      )

      // Then
      portefeuille = screen.getByRole('table')
      expect(within(portefeuille).getAllByRole('row')).toHaveLength(1 + 1)
      expect(() => within(portefeuille).getByText('CEJ')).toThrow()

      // When
      await userEvent.click(buttonFiltres)
      await userEvent.click(
        screen.getByRole('radio', { name: 'Tous les dispositifs' })
      )
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Valider la sélection du dispositif',
        })
      )

      // Then
      portefeuille = screen.getByRole('table')
      expect(within(portefeuille).getAllByRole('row')).toHaveLength(4 + 1)
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

    it('affiche la colonne nombre d’heures déclarées', () => {
      // Then
      expect(
        screen.getByRole('columnheader', { name: 'Nombre d’heures déclarées' })
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

    it('affiche les heures déclarées', () => {
      const row1 = screen.getByRole('cell', {
        name: /Accéder à la fiche de Jirac Kenji/,
      }).parentElement!
      const row2 = screen.getByRole('cell', {
        name: /Accéder à la fiche de Sanfamiye Nadia/,
      }).parentElement!
      const row3 = screen.getByRole('cell', {
        name: /Accéder à la fiche de D'Aböville-Muñoz François Maria/,
      }).parentElement!

      //THEN
      expect(
        within(row1).getByRole('cell', {
          name: 'Actualisé il y a 1h 5min 15h déclarées',
        })
      ).toBeInTheDocument()
      expect(
        within(row2).getByRole('cell', {
          name: 'Actualisé il y a 1h 5min 1h déclarée',
        })
      ).toBeInTheDocument()
      expect(
        within(row3).getByRole('cell', {
          name: 'Actualisé il y a 1h 5min 12h déclarées',
        })
      ).toBeInTheDocument()
    })

    it('permet de trier bénéficiaires par heures déclarées', async () => {
      //when
      const button = screen.getByRole('button', {
        name: /Trier par heures/i,
      })

      //then
      expect(button).toHaveAttribute(
        'title',
        'Trier par heures ordre alphabétique inversé'
      )

      await userEvent.click(button)

      expect(button).toHaveAttribute(
        'title',
        'Trier par heures ordre alphabétique'
      )
    })
  })

  describe('quand le conseiller est France Travail', () => {
    beforeEach(async () => {
      //GIVEN
      ;({ container } = await renderWithContexts(
        <PortefeuillePage conseillerJeunes={jeunes} isFromEmail page={1} />,
        {
          customConseiller: { structure: structureFTCej },
        }
      ))
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

      ;({ container } = await renderWithContexts(
        <PortefeuillePage conseillerJeunes={[jeune]} isFromEmail page={1} />,
        {
          customConseiller: { structure: 'CONSEIL_DEPT' },
        }
      ))
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
      await renderWithContexts(
        <PortefeuillePage conseillerJeunes={[]} isFromEmail page={1} />
      )

      // Then
      expect(() =>
        screen.getByLabelText(
          /Rechercher un bénéficiaire par son nom ou prénom/
        )
      ).toThrow()
    })

    it('affiche un message invitant à ajouter des bénéficiaires', async () => {
      // GIVEN
      await renderWithContexts(
        <PortefeuillePage conseillerJeunes={[]} isFromEmail page={1} />
      )

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
        await renderWithContexts(
          <PortefeuillePage conseillerJeunes={[]} isFromEmail page={1} />,
          { customConseiller: conseiller }
        )
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
      await renderWithContexts(
        <PortefeuillePage conseillerJeunes={jeunes} isFromEmail page={1} />
      )

      //THEN
      expect(screen.getAllByRole('row')).toHaveLength(jeunes.length + 1)
    })
  })
})
