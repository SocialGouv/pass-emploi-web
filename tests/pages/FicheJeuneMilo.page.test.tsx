import { act, screen } from '@testing-library/react'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { desActionsInitiales } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import { desIndicateursSemaine, unDetailJeune } from 'fixtures/jeune'
import { StructureConseiller } from 'interfaces/conseiller'
import FicheJeune from 'pages/mes-jeunes/[jeune_id]'
import { getServerSideProps } from 'pages/mes-jeunes/milo/[numero_dossier]'
import { recupererAgenda } from 'services/agenda.service'
import {
  getIdJeuneMilo,
  getIndicateursJeuneAlleges,
} from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'
import { trackSSR } from 'utils/analytics/matomo'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/jeunes.service')
jest.mock('services/agenda.service')
jest.mock('utils/analytics/matomo')

describe('Fiche Jeune MiLo', () => {
  describe('server side', () => {
    describe("Quand l'utilisateur n'est pas connecté", () => {
      it('requiert la connexion', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: false,
          redirect: { destination: 'whatever' },
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
        expect(actual).toEqual({ redirect: { destination: 'whatever' } })
      })
    })

    describe("Quand l'utilisateur est connecté", () => {
      describe('Pour un conseiller pas MiLo', () => {
        it('redirige vers la liste des jeunes', async () => {
          // Given
          ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
            validSession: true,
            session: { user: { structure: StructureConseiller.POLE_EMPLOI } },
          })

          // When
          const actual = await getServerSideProps(
            {} as GetServerSidePropsContext
          )

          // Then
          expect(actual).toEqual({
            redirect: { destination: '/mes-jeunes', permanent: false },
          })
        })
      })

      describe('Pour un conseiller MiLo', () => {
        beforeEach(() => {
          // Given
          ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
            validSession: true,
            session: { user: { structure: StructureConseiller.MILO } },
          })
        })

        describe('Quand le jeune existe', () => {
          it('redirige vers la fiche du jeune', async () => {
            // Given
            ;(getIdJeuneMilo as jest.Mock).mockResolvedValue('id-jeune')

            // When
            const actual = await getServerSideProps({
              query: { numero_dossier: 'numero-dossier' },
              req: { headers: { referer: 'referer-url' } },
            } as unknown as GetServerSidePropsContext)

            // Then
            expect(trackSSR).toHaveBeenCalledWith({
              structure: 'MILO',
              customTitle: 'Détail jeune par numéro dossier',
              pathname: '/mes-jeunes/milo/numero-dossier',
              refererUrl: 'referer-url',
              avecBeneficiaires: 'oui',
            })
            expect(actual).toEqual({
              redirect: {
                destination: '/mes-jeunes/id-jeune',
                permanent: false,
              },
            })
          })
        })

        describe("Quand le jeune n'existe pas", () => {
          it('redirige vers la liste des jeunes', async () => {
            // Given
            ;(getIdJeuneMilo as jest.Mock).mockResolvedValue(undefined)

            // When
            const actual = await getServerSideProps({
              query: { numero_dossier: 'dossier-inexistant' },
              req: { headers: { referer: 'referer-url' } },
            } as unknown as GetServerSidePropsContext)

            // Then
            expect(trackSSR).toHaveBeenCalledWith({
              structure: 'MILO',
              customTitle: 'Détail jeune par numéro dossier en erreur',
              pathname: '/mes-jeunes/milo/dossier-inexistant',
              refererUrl: 'referer-url',
              avecBeneficiaires: 'non',
            })
            expect(actual).toEqual({
              redirect: { destination: '/mes-jeunes', permanent: false },
            })
          })
        })
      })
    })
  })

  describe('client side', () => {
    describe('quand la structure du bénéficiaire est différente du conseiller', () => {
      it('affiche un message', async () => {
        // Given
        ;(useRouter as jest.Mock).mockReturnValue({ asPath: '/mes-jeunes' })
        ;(getIndicateursJeuneAlleges as jest.Mock).mockResolvedValue(
          desIndicateursSemaine()
        )
        ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())

        const jeune = unDetailJeune({ structureMilo: { id: '2' } })

        // When
        await act(async () => {
          await renderWithContexts(
            <FicheJeune
              jeune={jeune}
              rdvs={[]}
              actionsInitiales={desActionsInitiales()}
              pageTitle={''}
            />,
            {
              customConseiller: {
                id: 'id-conseiller',
                structure: StructureConseiller.MILO,
                structureMilo: { nom: 'Agence', id: '1' },
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
})
