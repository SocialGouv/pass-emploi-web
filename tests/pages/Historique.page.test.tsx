import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { desConseillersJeune, unDetailJeune } from 'fixtures/jeune'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  CategorieSituation,
  ConseillerHistorique,
  EtatSituation,
} from 'interfaces/jeune'
import Historique, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/historique'
import {
  getConseillersDuJeuneServerSide,
  getJeuneDetails,
} from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/jeunes.service')

describe('Historique', () => {
  const listeSituations = [
    {
      etat: EtatSituation.EN_COURS,
      categorie: CategorieSituation.EMPLOI,
    },
    {
      etat: EtatSituation.PREVU,
      categorie: CategorieSituation.CONTRAT_EN_ALTERNANCE,
    },
  ]
  const listeConseillers = desConseillersJeune()

  describe('client side', () => {
    beforeEach(async () => {
      ;(useRouter as jest.Mock).mockReturnValue({ asPath: '/mes-jeunes' })
    })

    describe('quand l’utilisateur est un conseiller Mission Locale', () => {
      describe('pour les Situations', () => {
        it('affiche un onglet dédié', () => {
          // Given
          renderHistorique([], [], StructureConseiller.MILO)

          // Then
          expect(
            screen.getByRole('tab', { selected: true })
          ).toHaveAccessibleName('Situations')
        })

        describe('quand le jeune n’a aucune situation', () => {
          it('affiche les informations concernant la situation du jeune', () => {
            // Given
            renderHistorique([], [], StructureConseiller.MILO)

            // Then
            expect(screen.getByText('Sans situation')).toBeInTheDocument()
          })
        })

        describe('quand le jeune a une liste de situations', () => {
          it('affiche les informations concernant la situation du jeune ', () => {
            // Given
            renderHistorique(listeSituations, [], StructureConseiller.MILO)

            // Then
            expect(screen.getByText('Emploi')).toBeInTheDocument()
            expect(screen.getByText('en cours')).toBeInTheDocument()
            expect(
              screen.getByText('Contrat en Alternance')
            ).toBeInTheDocument()
            expect(screen.getByText('prévue')).toBeInTheDocument()
          })
        })
      })

      describe('pour l’Historique des conseillers', () => {
        it('affiche un onglet dédié', async () => {
          // Given
          renderHistorique([], [], StructureConseiller.MILO)

          // When
          const tabConseillers = screen.getByRole('tab', {
            name: 'Historique des conseillers',
          })
          await userEvent.click(tabConseillers)

          // Then
          expect(
            screen.getByRole('tab', { selected: true })
          ).toHaveAccessibleName('Historique des conseillers')
        })

        it('affiche la liste complète des conseillers du jeune', async () => {
          // Given
          renderHistorique([], listeConseillers, StructureConseiller.MILO)

          // When
          const tabConseillers = screen.getByRole('tab', {
            name: 'Historique des conseillers',
          })
          await userEvent.click(tabConseillers)

          //Then
          listeConseillers.forEach(({ nom, prenom }: ConseillerHistorique) => {
            expect(screen.getByText(`${nom} ${prenom}`)).toBeInTheDocument()
          })
        })
      })
    })

    describe('quand l’utilisateur est un conseiller Pôle Empoi', () => {
      it('affiche uniquement l’onglet Historique des conseiller', () => {
        // Given
        renderHistorique([], [], StructureConseiller.POLE_EMPLOI)

        // Then
        expect(() => screen.getByText('Situations')).toThrow()
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Historique des conseillers')
      })

      it('affiche la liste complète des conseillers du jeune', async () => {
        // Given
        renderHistorique([], listeConseillers, StructureConseiller.POLE_EMPLOI)

        //Then
        listeConseillers.forEach(({ nom, prenom }: ConseillerHistorique) => {
          expect(screen.getByText(`${nom} ${prenom}`)).toBeInTheDocument()
        })
      })
    })
  })

  describe('server side', () => {
    beforeEach(() => {
      ;(getJeuneDetails as jest.Mock).mockResolvedValue(
        unDetailJeune({ situations: listeSituations })
      )
      ;(getConseillersDuJeuneServerSide as jest.Mock).mockResolvedValue(
        desConseillersJeune()
      )
    })

    describe('Quand la session est invalide', () => {
      it('redirige', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          redirect: 'whatever',
          validSession: false,
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({ redirect: 'whatever' })
      })
    })

    describe('Quand la session est valide', () => {
      let actual: GetServerSidePropsResult<any>

      beforeEach(async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: {
            accessToken: 'accessToken',
            user: { id: 'id-conseiller' },
          },
          validSession: true,
        })

        // When
        actual = await getServerSideProps({
          query: { jeune_id: 'id-jeune' },
        } as unknown as GetServerSidePropsContext)
      })

      it('récupère l’id et la situation du jeune', async () => {
        // Then
        expect(getJeuneDetails).toHaveBeenCalledWith('id-jeune', 'accessToken')
        expect(actual).toEqual({
          props: {
            idJeune: 'jeune-1',
            lectureSeule: false,
            pageTitle: `Portefeuille - Kenji Jirac - Historique`,
            pageHeader: 'Historique',
            situations: expect.arrayContaining(listeSituations),
            conseillers: expect.arrayContaining([]),
          },
        })
      })

      it('récupère les conseillers du jeune', async () => {
        // Then
        expect(getConseillersDuJeuneServerSide).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: { conseillers: desConseillersJeune() },
        })
      })
    })
  })
})

function renderHistorique(
  situations: Array<{
    etat?: EtatSituation
    categorie: CategorieSituation
    dateFin?: string
  }>,
  conseillers: ConseillerHistorique[],
  structure: StructureConseiller
) {
  renderWithContexts(
    <Historique
      idJeune={'id'}
      situations={situations}
      conseillers={conseillers}
      pageTitle={''}
      lectureSeule={false}
    />,
    { customConseiller: { structure: structure } }
  )
}
