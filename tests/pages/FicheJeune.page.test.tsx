import { screen } from '@testing-library/react'
import { uneListeDActions } from 'fixtures/action'
import { unJeune } from 'fixtures/jeune'
import { uneListeDeRdv } from 'fixtures/rendez-vous'
import { mockedJeunesService, mockedRendezVousService } from 'fixtures/services'
import { UserStructure } from 'interfaces/conseiller'
import { useRouter } from 'next/router'
import FicheJeune from 'pages/mes-jeunes/[jeune_id]'
import React from 'react'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import { DIProvider } from 'utils/injectionDependances'
import renderWithSession from '../renderWithSession'

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
  let jeunesService: JeunesService
  let rendezVousService: RendezVousService
  beforeEach(async () => {
    jeunesService = mockedJeunesService()
    rendezVousService = mockedRendezVousService()
  })

  describe("quand l'utilisateur n'est pas un conseiller Pole emploi", () => {
    beforeEach(async () => {
      // When
      renderWithSession(
        <DIProvider dependances={{ jeunesService, rendezVousService }}>
          <FicheJeune jeune={jeune} rdvs={rdvs} actions={actions} />
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
      expect(
        screen.getByRole('link', {
          name: 'Voir la liste des actions du jeune',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: 'Voir la liste des actions du jeune',
        })
      ).toHaveAttribute('href', `/mes-jeunes/${jeune.id}/actions`)
    })

    it('affiche les actions du jeune', async () => {
      actions.forEach((action) => {
        expect(screen.getByText(action.content)).toBeInTheDocument()
      })
    })

    it('affiche un lien d acces à la page d action quand le jeune n a pas d action', async () => {
      renderWithSession(
        <DIProvider dependances={{ jeunesService, rendezVousService }}>
          <FicheJeune jeune={jeune} rdvs={rdvs} actions={[]} />
        </DIProvider>
      )
      expect(
        screen.getByRole('link', {
          name: 'Accédez à cette page pour créer une action',
        })
      ).toBeInTheDocument()
    })

    it('permet la prise de rendez-vous', async () => {
      // Then
      expect(screen.getByText('Fixer un rendez-vous')).toBeInTheDocument()
    })
  })

  describe("quand l'utilisateur est un conseiller Pole emploi", () => {
    beforeEach(async () => {
      // When
      renderWithSession(
        <DIProvider dependances={{ jeunesService, rendezVousService }}>
          <FicheJeune jeune={jeune} rdvs={[]} actions={actions} />
        </DIProvider>,
        {
          user: {
            id: 'idConseiller',
            name: 'Tavernier',
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

  describe('quand la création de rdv est réussie', () => {
    let replace: jest.Mock
    beforeEach(() => {
      // Given
      replace = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({ replace })

      // When
      renderWithSession(
        <DIProvider dependances={{ jeunesService, rendezVousService }}>
          <FicheJeune
            jeune={jeune}
            rdvs={rdvs}
            actions={actions}
            rdvCreationSuccess={true}
          />
        </DIProvider>
      )
    })

    it('affiche un message de succès', () => {
      // Then
      expect(
        screen.getByText('Le rendez-vous a bien été créé')
      ).toBeInTheDocument()
    })

    it('permet de cacher le message de succès', () => {
      // Given
      const fermerMessage = screen.getByRole('button', {
        name: "J'ai compris",
      })

      // When
      fermerMessage.click()

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
})
