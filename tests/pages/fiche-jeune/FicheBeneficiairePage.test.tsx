import { act, screen } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desActionsInitiales, desCategories } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import {
  desIndicateursSemaine,
  unDetailBeneficiaire,
  uneMetadonneeFavoris,
} from 'fixtures/beneficiaire'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import { MetadonneesFavoris } from 'interfaces/beneficiaire'
import { StructureConseiller } from 'interfaces/conseiller'
import { Offre, Recherche } from 'interfaces/favoris'
import { recupererAgenda } from 'services/agenda.service'
import { getIndicateursJeuneAlleges } from 'services/beneficiaires.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/agenda.service')

describe('FicheBeneficiairePage client side', () => {
  beforeEach(async () => {
    ;(getIndicateursJeuneAlleges as jest.Mock).mockResolvedValue(
      desIndicateursSemaine()
    )
    ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())
  })

  describe('pour tous les conseillers', () => {
    it('modifie le currentJeune', async () => {
      // Given
      const setIdJeune = jest.fn()
      const jeune = unDetailBeneficiaire()

      // When
      await act(async () => {
        renderWithContexts(
          <FicheBeneficiairePage
            beneficiaire={jeune}
            rdvs={[]}
            actionsInitiales={desActionsInitiales()}
            categoriesActions={desCategories()}
            onglet='AGENDA'
            lectureSeule={false}
          />,
          {
            customCurrentJeune: { idSetter: setIdJeune },
            customConseiller: { id: jeune.idConseiller },
          }
        )
      })

      // Then
      expect(setIdJeune).toHaveBeenCalledWith('beneficiaire-1')
    })
  })

  describe('pour les conseillers non référent', () => {
    let container: HTMLElement
    let setIdJeune: (id: string | undefined) => void
    beforeEach(async () => {
      // Given
      setIdJeune = jest.fn()

      // When
      await act(async () => {
        ;({ container } = renderWithContexts(
          <FicheBeneficiairePage
            beneficiaire={unDetailBeneficiaire()}
            rdvs={[]}
            actionsInitiales={desActionsInitiales()}
            categoriesActions={desCategories()}
            onglet='AGENDA'
            lectureSeule={true}
          />,
          {
            customConseiller: { id: 'fake-id' },
            customCurrentJeune: { idSetter: setIdJeune },
          }
        ))
      })
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('ne modifie pas le currentJeune', async () => {
      //Then
      expect(setIdJeune).not.toHaveBeenCalled()
    })

    it('restreint l‘accès aux boutons', async () => {
      //Then
      expect(
        screen.queryByRole('button', { name: 'Supprimer ce compte' })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: 'Créer un rendez-vous' })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: 'Créer une action' })
      ).not.toBeInTheDocument()
    })

    it('affiche un encart lecture seule', async () => {
      //Then
      expect(screen.getByText('Vous êtes en lecture seule')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Vous pouvez uniquement lire la fiche de ce bénéficiaire car il ne fait pas partie de votre portefeuille.'
        )
      ).toBeInTheDocument()
    })
  })

  describe('pour les conseillers non France Travail', () => {
    let container: HTMLElement

    it('a11y', async () => {
      await act(async () => {
        ;({ container } = renderWithContexts(
          <FicheBeneficiairePage
            beneficiaire={unDetailBeneficiaire()}
            rdvs={[]}
            actionsInitiales={desActionsInitiales()}
            categoriesActions={desCategories()}
            onglet='AGENDA'
            lectureSeule={false}
          />,
          {
            customConseiller: { structure: StructureConseiller.MILO },
          }
        ))
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('affiche un lien pour accéder au calendrier de l’établissement', async () => {
      // When
      await act(async () => {
        renderWithContexts(
          <FicheBeneficiairePage
            beneficiaire={unDetailBeneficiaire()}
            rdvs={[]}
            actionsInitiales={desActionsInitiales()}
            categoriesActions={desCategories()}
            onglet='AGENDA'
            lectureSeule={false}
          />,
          {
            customConseiller: { structure: StructureConseiller.MILO },
          }
        )
      })

      // Then
      expect(
        screen.getByRole('link', {
          name: 'Inscrire à une animation collective',
        })
      ).toHaveAttribute('href', '/agenda?onglet=etablissement')
    })

    describe('quand le compte du bénéficiaire n’est pas activé', () => {
      it('affiche un message', async () => {
        // When
        await act(async () => {
          renderWithContexts(
            <FicheBeneficiairePage
              beneficiaire={unDetailBeneficiaire({ isActivated: false })}
              rdvs={[]}
              actionsInitiales={desActionsInitiales()}
              categoriesActions={desCategories()}
              onglet='AGENDA'
              lectureSeule={false}
            />,
            {
              customConseiller: { structure: StructureConseiller.MILO },
            }
          )
        })

        // Then
        expect(
          screen.getByText(
            /Ce bénéficiaire ne s’est pas encore connecté à l’application/
          )
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            /Le lien d’activation envoyé par i-milo à l’adresse e-mail du bénéficiaire n’est valable que 24h/
          )
        ).toBeInTheDocument()
      })
    })
  })

  describe('pour les conseillers non Milo', () => {
    let offresFT: Offre[],
      recherchesFT: Recherche[],
      metadonneesFavoris: MetadonneesFavoris
    beforeEach(async () => {
      //Given
      metadonneesFavoris = uneMetadonneeFavoris()
      offresFT = uneListeDOffres()
      recherchesFT = uneListeDeRecherches()
    })

    it('a11y', async () => {
      let results: AxeResults
      const container = await renderFicheJeune(
        metadonneesFavoris,
        offresFT,
        recherchesFT
      )

      await act(async () => {
        results = await axe(container)
      })

      expect(results).toHaveNoViolations()
    })

    it('n’affiche pas les onglets agenda, actions et rdv', async () => {
      // When
      await renderFicheJeune(metadonneesFavoris, offresFT, recherchesFT)

      // Then
      expect(() => screen.getByText('Agenda')).toThrow()
      expect(() => screen.getByText('Actions')).toThrow()
      expect(() => screen.getByText('Rendez-vous')).toThrow()
    })

    it('affiche les onglets recherche et offres si le bénéficiaire a accepté le partage', async () => {
      // When
      await renderFicheJeune(metadonneesFavoris, offresFT, recherchesFT)

      // Then
      expect(screen.getByText('Offres')).toBeInTheDocument()
      expect(screen.getByText('Recherches')).toBeInTheDocument()
    })

    it('affiche le récapitulatif des favoris si le bénéficiaire a refusé le partage', async () => {
      // Given
      metadonneesFavoris.autoriseLePartage = false

      //When
      await renderFicheJeune(metadonneesFavoris, offresFT, recherchesFT)

      // Then
      expect(screen.getByText(/Emplois/)).toBeInTheDocument()
      expect(screen.getByText(/Alternances/)).toBeInTheDocument()
      expect(screen.getByText(/Services civiques/)).toBeInTheDocument()
      expect(screen.getByText(/Immersions/)).toBeInTheDocument()
      expect(screen.getByText(/Alertes/)).toBeInTheDocument()
    })

    describe('quand le compte du bénéficiaire n’est pas activé', () => {
      it('affiche un message', async () => {
        // When
        await act(async () => {
          renderWithContexts(
            <FicheBeneficiairePage
              beneficiaire={unDetailBeneficiaire({ isActivated: false })}
              rdvs={[]}
              actionsInitiales={desActionsInitiales()}
              categoriesActions={desCategories()}
              onglet='AGENDA'
              lectureSeule={false}
            />
          )
        })

        // Then
        expect(
          screen.getByText(
            /Ce bénéficiaire ne s’est pas encore connecté à l’application/
          )
        ).toBeInTheDocument()
        expect(() =>
          screen.getByText(
            /Le lien d’activation envoyé par i-milo sur l‘adresse e-mail du jeune n’est valable que 24h/
          )
        ).toThrow()
      })
    })
  })

  describe('pour les conseillers départementaux', () => {
    let offresFT: Offre[],
      recherchesFT: Recherche[],
      metadonneesFavoris: MetadonneesFavoris
    beforeEach(async () => {
      //Given
      metadonneesFavoris = uneMetadonneeFavoris()
      offresFT = uneListeDOffres()
      recherchesFT = uneListeDeRecherches()
    })

    it('affiche un message pour la récupération des démarches', async () => {
      //When
      await renderWithContexts(
        <FicheBeneficiairePage
          beneficiaire={unDetailBeneficiaire()}
          rdvs={[]}
          actionsInitiales={desActionsInitiales()}
          categoriesActions={desCategories()}
          lectureSeule={false}
          metadonneesFavoris={metadonneesFavoris}
          offresFT={offresFT}
          recherchesFT={recherchesFT}
          demarches={[]}
        />,
        {
          customConseiller: { structure: StructureConseiller.CONSEIL_DEPT },
        }
      )

      //Then
      expect(
        screen.getByText(
          'Vous pouvez consulter les démarches de votre bénéficiaire s’il se connecte à son application dans un délai de 30 jours.'
        )
      ).toBeInTheDocument()
    })
  })

  describe('quand la structure du bénéficiaire est différente du conseiller', () => {
    it('affiche un message', async () => {
      // When
      await act(async () => {
        renderWithContexts(
          <FicheBeneficiairePage
            beneficiaire={unDetailBeneficiaire({ structureMilo: { id: '2' } })}
            rdvs={[]}
            actionsInitiales={desActionsInitiales()}
            categoriesActions={desCategories()}
            onglet='AGENDA'
            lectureSeule={false}
          />,
          {
            customConseiller: {
              structure: StructureConseiller.MILO,
              structureMilo: { nom: 'Mission locale', id: '1' },
            },
          }
        )
      })

      // Then
      expect(
        screen.getByText(
          /Ce bénéficiaire est rattaché à une Mission Locale différente de la vôtre./
        )
      ).toBeInTheDocument()
    })
  })
})

async function renderFicheJeune(
  metadonnees: MetadonneesFavoris,
  offresFT: Offre[],
  recherchesFT: Recherche[],
  lectureSeule?: boolean
): Promise<HTMLElement> {
  let container: HTMLElement
  await act(async () => {
    ;({ container } = renderWithContexts(
      <FicheBeneficiairePage
        beneficiaire={unDetailBeneficiaire()}
        rdvs={[]}
        actionsInitiales={desActionsInitiales()}
        categoriesActions={desCategories()}
        onglet='AGENDA'
        lectureSeule={lectureSeule ?? false}
        metadonneesFavoris={metadonnees}
        offresFT={offresFT}
        recherchesFT={recherchesFT}
        demarches={[]}
      />,
      {
        customConseiller: { structure: StructureConseiller.POLE_EMPLOI },
      }
    ))
  })
  return container
}
