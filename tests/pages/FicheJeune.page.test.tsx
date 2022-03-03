import { screen } from '@testing-library/react'
import { uneListeDActions } from 'fixtures/action'
import { unJeune } from 'fixtures/jeune'
import { uneListeDeRdvJeune } from 'fixtures/rendez-vous'
import { mockedJeunesService } from 'fixtures/services'
import { UserStructure } from 'interfaces/conseiller'
import FicheJeune from 'pages/mes-jeunes/[jeune_id]'
import React from 'react'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import { DIProvider } from 'utils/injectionDependances'
import renderWithSession from '../renderWithSession'

describe('Fiche Jeune', () => {
  const idConseiller = 'idConseiller'
  const jeune = unJeune({ firstName: 'Nadia', lastName: 'Sanfamiye' })
  const rdvs = uneListeDeRdvJeune()
  const actions = uneListeDActions()
  let jeunesService: JeunesService
  let rendezVousService: RendezVousService
  beforeEach(async () => {
    jeunesService = mockedJeunesService()
    rendezVousService = {
      deleteRendezVous: jest.fn(),
      getRendezVousConseiller: jest.fn(),
      getRendezVousJeune: jest.fn(),
      postNewRendezVous: jest.fn(),
    }
  })

  describe("quand l'utilisateur n'est pas un conseiller Pole emploi", () => {
    beforeEach(async () => {
      // When
      renderWithSession(
        <DIProvider dependances={{ jeunesService, rendezVousService }}>
          <FicheJeune
            idConseiller={idConseiller}
            jeune={jeune}
            rdvs={rdvs}
            actions={actions}
          />
        </DIProvider>
      )
    })

    it('affiche le titre de la fiche', async () => {
      // Then
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Nadia Sanfamiye'
      )
    })

    it('affiche la liste des rendez-vous du jeune', async () => {
      // Then
      rdvs.forEach((rdv) => {
        expect(screen.getByText(rdv.comment)).toBeInTheDocument()
      })
    })

    it('affiche un lien vers les actions du jeune', async () => {
      // Then
      expect(
        screen.getByRole('link', { name: 'Voir la liste des actions du jeune' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: 'Voir la liste des actions du jeune' })
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
          <FicheJeune
            idConseiller={idConseiller}
            jeune={jeune}
            rdvs={rdvs}
            actions={[]}
          />
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
          <FicheJeune
            idConseiller={idConseiller}
            jeune={jeune}
            rdvs={[]}
            actions={actions}
          />
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
})
