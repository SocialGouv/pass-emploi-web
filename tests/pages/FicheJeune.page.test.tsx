import { act, screen } from '@testing-library/react'
import { uneListeDActions } from 'fixtures/action'
import { desConseillersJeune, unJeune } from 'fixtures/jeune'
import { uneListeDeRdv } from 'fixtures/rendez-vous'
import { mockedJeunesService, mockedRendezVousService } from 'fixtures/services'
import { UserStructure } from 'interfaces/conseiller'
import { useRouter } from 'next/router'
import FicheJeune from 'pages/mes-jeunes/[jeune_id]'
import React from 'react'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import { CurrentJeuneProvider } from 'utils/chat/currentJeuneContext'
import { DIProvider } from 'utils/injectionDependances'
import renderWithSession from '../renderWithSession'
import { ConseillerHistorique } from 'interfaces/jeune'

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    asPath: '/mes-jeunes/jeune-1',
  })),
}))

describe('Fiche Jeune', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })

  const jeune = unJeune()
  const rdvs = uneListeDeRdv()
  const actions = uneListeDActions()
  const listeConseillers = desConseillersJeune()

  let jeunesService: JeunesService
  let rendezVousService: RendezVousService
  beforeEach(async () => {
    jeunesService = mockedJeunesService()
    rendezVousService = mockedRendezVousService()
  })

  describe("quand l'utilisateur n'est pas un conseiller Pole emploi", () => {
    let setJeune: () => void
    beforeEach(async () => {
      // Given
      setJeune = jest.fn()

      // When
      renderWithSession(
        <DIProvider dependances={{ jeunesService, rendezVousService }}>
          <CurrentJeuneProvider setJeune={setJeune}>
            <FicheJeune
              jeune={jeune}
              rdvs={rdvs}
              actions={actions}
              conseillers={listeConseillers}
            />
          </CurrentJeuneProvider>
        </DIProvider>
      )
    })

    it('affiche le titre de la fiche', async () => {
      // Then
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Kenji Jirac'
      )
    })

    it('affiche la liste des rendez-vous du jeune', async () => {
      // Then
      rdvs.forEach((rdv) => {
        expect(screen.getByText(rdv.type.label)).toBeInTheDocument()
        expect(screen.getByText(rdv.modality)).toBeInTheDocument()
      })
    })

    it('affiche un lien vers les actions du jeune', async () => {
      // Then
      const lienActions = screen.getByRole('link', {
        name: 'Voir la liste des actions du jeune',
      })
      expect(lienActions).toBeInTheDocument()
      expect(lienActions).toHaveAttribute(
        'href',
        `/mes-jeunes/${jeune.id}/actions`
      )
    })

    it('affiche les actions du jeune', async () => {
      actions.forEach((action) => {
        expect(screen.getByText(action.content)).toBeInTheDocument()
      })
    })

    it('permet la prise de rendez-vous', async () => {
      // Then
      expect(screen.getByText('Fixer un rendez-vous')).toBeInTheDocument()
    })

    it('affiche la liste des 5 premiers conseillers du jeune', () => {
      // Then
      listeConseillers
        .slice(0, 5)
        .forEach(({ nom, prenom }: ConseillerHistorique) => {
          expect(screen.getByText(`${nom} ${prenom}`)).toBeInTheDocument()
        })
      expect(() => screen.getByText(listeConseillers[5].nom)).toThrow()
    })

    it('affiche un bouton pour dérouler la liste complète des conseillers du jeune', async () => {
      // Then
      const button = screen.getByRole('button', {
        name: 'Voir l’historique complet',
      })
      expect(button).toBeInTheDocument()
    })

    it('permet d’afficher la liste complète des conseillers du jeune', async () => {
      // Given
      const button = screen.getByRole('button', {
        name: 'Voir l’historique complet',
      })

      // When
      act(() => {
        button.click()
      })

      //Then
      listeConseillers.forEach(({ nom, prenom }: ConseillerHistorique) => {
        expect(screen.getByText(`${nom} ${prenom}`)).toBeInTheDocument()
      })
    })

    it('modifie le currentJeune', () => {
      // Then
      expect(setJeune).toHaveBeenCalledWith(jeune)
    })
  })

  describe("quand l'utilisateur est un conseiller Pole emploi", () => {
    beforeEach(async () => {
      // When
      renderWithSession(
        <DIProvider dependances={{ jeunesService, rendezVousService }}>
          <CurrentJeuneProvider>
            <FicheJeune
              jeune={jeune}
              rdvs={[]}
              actions={actions}
              conseillers={[]}
            />
          </CurrentJeuneProvider>
        </DIProvider>,
        {
          user: {
            id: 'idConseiller',
            name: 'Tavernier',
            email: 'fake@email.fr',
            structure: UserStructure.POLE_EMPLOI,
            estSuperviseur: false,
          },
        }
      )
    })

    it("n'affiche pas la liste des rendez-vous du jeune", async () => {
      // Then
      rdvs.forEach((rdv) => {
        expect(() => screen.getByText(rdv.comment)).toThrow()
      })
    })

    it("n'affiche pas de lien vers les actions du jeune", async () => {
      // Then
      expect(() =>
        screen.getByRole('link', { name: 'Voir la liste des actions du jeune' })
      ).toThrow()
    })

    it('ne permet pas la prise de rendez-vous', async () => {
      // Then
      expect(() => screen.getByText('Fixer un rendez-vous')).toThrow()
    })
  })

  it('affiche un lien d acces à la page d action quand le jeune n a pas d action', async () => {
    renderWithSession(
      <DIProvider dependances={{ jeunesService, rendezVousService }}>
        <CurrentJeuneProvider>
          <FicheJeune jeune={jeune} rdvs={rdvs} actions={[]} conseillers={[]} />
        </CurrentJeuneProvider>
      </DIProvider>
    )
    expect(
      screen.getByRole('link', {
        name: 'Accédez à cette page pour créer une action',
      })
    ).toBeInTheDocument()
  })

  describe('quand la création de rdv est réussie', () => {
    let replace: jest.Mock
    beforeEach(() => {
      // Given
      replace = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({ replace })

      // When
      renderWithSession(
        <DIProvider dependances={{ jeunesService, rendezVousService }}>
          <CurrentJeuneProvider>
            <FicheJeune
              jeune={jeune}
              rdvs={rdvs}
              actions={actions}
              rdvCreationSuccess={true}
              conseillers={[]}
            />
          </CurrentJeuneProvider>
        </DIProvider>
      )
    })

    it('affiche un message de succès', () => {
      // Then
      expect(
        screen.getByText('Le rendez-vous a bien été créé')
      ).toBeInTheDocument()
    })

    it('permet de cacher le message de succès', async () => {
      // Given
      const fermerMessage = screen.getByRole('button', {
        name: "J'ai compris",
      })

      // When
      await act(async () => fermerMessage.click())

      // Then
      expect(() => screen.getByText('Le rendez-vous a bien été créé')).toThrow()
      expect(replace).toHaveBeenCalledWith(
        {
          pathname: `/mes-jeunes/${jeune.id}`,
        },
        undefined,
        { shallow: true }
      )
    })
  })
  describe('quand la modification de rdv est réussie', () => {
    let replace: jest.Mock
    beforeEach(() => {
      // Given
      replace = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({ replace })

      // When
      renderWithSession(
        <DIProvider dependances={{ jeunesService, rendezVousService }}>
          <CurrentJeuneProvider>
            <FicheJeune
              jeune={jeune}
              rdvs={rdvs}
              conseillers={[]}
              actions={actions}
              rdvModificationSuccess={true}
            />
          </CurrentJeuneProvider>
        </DIProvider>
      )
    })

    it('affiche un message de succès', () => {
      // Then
      expect(
        screen.getByText('Le rendez-vous a bien été modifié')
      ).toBeInTheDocument()
    })

    it('permet de cacher le message de succès', async () => {
      // Given
      const fermerMessage = screen.getByRole('button', {
        name: "J'ai compris",
      })

      // When
      await act(async () => fermerMessage.click())

      // Then
      expect(() =>
        screen.getByText('Le rendez-vous a bien été modifié')
      ).toThrow()
      expect(replace).toHaveBeenCalledWith(
        {
          pathname: `/mes-jeunes/${jeune.id}`,
        },
        undefined,
        { shallow: true }
      )
    })
  })
})
