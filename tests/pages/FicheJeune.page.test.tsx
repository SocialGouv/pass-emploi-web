import { screen } from '@testing-library/react'
import { unJeune } from 'fixtures/jeune'
import { UserStructure } from 'interfaces/conseiller'
import React from 'react'
import { uneListeDeRdvJeune } from '../../fixtures/rendez-vous'
import FicheJeune from '../../pages/mes-jeunes/[jeune_id]'
import { JeunesService } from '../../services/jeunes.service'
import { RendezVousService } from '../../services/rendez-vous.service'
import { DIProvider } from '../../utils/injectionDependances'
import renderWithSession from '../renderWithSession'

describe('Fiche Jeune', () => {
  const idConseiller = 'idConseiller'
  const jeune = unJeune({ firstName: 'Nadia', lastName: 'Sanfamiye' })
  const rdvs = uneListeDeRdvJeune()
  let jeunesService: JeunesService
  let rendezVousService: RendezVousService
  beforeEach(async () => {
    jeunesService = {
      createCompteJeunePoleEmploi: jest.fn(),
      getJeuneDetails: jest.fn(),
      getJeunesDuConseiller: jest.fn(),
    }
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
          <FicheJeune idConseiller={idConseiller} jeune={jeune} rdvs={rdvs} />
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
  })

  describe("quand l'utilisateur est un conseiller Pole emploi", () => {
    beforeEach(async () => {
      // When
      renderWithSession(
        <DIProvider dependances={{ jeunesService, rendezVousService }}>
          <FicheJeune idConseiller={idConseiller} jeune={jeune} rdvs={[]} />
        </DIProvider>,
        {
          user: {
            id: 'idConseiller',
            name: 'Tavernier',
            structure: UserStructure.POLE_EMPLOI,
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
  })
})
