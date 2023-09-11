import { act, screen } from '@testing-library/react'
import { GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import renderWithContexts from '../renderWithContexts'

import { unEvenementListItem } from 'fixtures/evenement'
import { unDetailJeune, uneBaseJeune } from 'fixtures/jeune'
import { EvenementListItem } from 'interfaces/evenement'
import RendezVousPasses, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/rendez-vous-passes'
import { getRendezVousJeune } from 'services/evenements.service'
import { getJeuneDetails } from 'services/jeunes.service'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/evenements.service')
jest.mock('services/jeunes.service')

describe('RendezVousPasses', () => {
  describe('client side', () => {
    describe('quand l’utilisateur n’est pas Pôle emploi ', () => {
      beforeEach(async () => {
        ;(useRouter as jest.Mock).mockReturnValue({ asPath: '/mes-jeunes' })
      })

      describe('quand il y a des rendez-vous passés', () => {
        let rdvs: EvenementListItem[]
        beforeEach(async () => {
          // Given
          rdvs = [
            unEvenementListItem({
              id: 'evenement-1',
              type: 'Atelier',
              futPresent: false,
            }),
            unEvenementListItem({
              id: 'evenement-2',
              type: 'Information collective',
              futPresent: true,
            }),
            unEvenementListItem({ id: 'evenement-3' }),
          ]

          await act(async () => {
            await renderWithContexts(
              <RendezVousPasses
                beneficiaire={uneBaseJeune()}
                lectureSeule={false}
                rdvs={rdvs}
              />
            )
          })
        })

        it('affiche le tableau des rendez-vous passés du conseiller avec le jeune', async () => {
          // Then
          expect(
            screen.getByRole('columnheader', { name: 'Horaires' })
          ).toBeInTheDocument()
          expect(
            screen.getByRole('columnheader', { name: 'Type' })
          ).toBeInTheDocument()
          expect(
            screen.getByRole('columnheader', {
              name: /Présent L’information de présence/,
            })
          ).toBeInTheDocument()

          rdvs.forEach((rdv) => {
            expect(screen.getByText(rdv.type)).toBeInTheDocument()
          })
        })

        describe('informe sur la présence du bénéficiaire', () => {
          it('quand la présence du bénéficiaire est renseignée', async () => {
            // Then
            expect(screen.getByText('Non')).not.toHaveAttribute(
              'class',
              'sr-only'
            )
            expect(screen.getByText('Oui')).not.toHaveAttribute(
              'class',
              'sr-only'
            )
          })

          it('quand la présence du bénéficiaire n’est pas renseignée', async () => {
            // Then
            expect(
              screen.getByText('information non disponible')
            ).toHaveAttribute('class', 'sr-only')
          })
        })
      })

      describe('quand il n’y a pas de rendez-vous passés', () => {
        it('affiche un message', async () => {
          // When
          await act(async () => {
            await renderWithContexts(
              <RendezVousPasses
                beneficiaire={uneBaseJeune()}
                lectureSeule={false}
                rdvs={[]}
              />,
              {}
            )
          })

          // Then
          expect(
            screen.getByText(
              'Aucun événement ou rendez-vous sur cette période pour votre bénéficiaire.'
            )
          ).toBeInTheDocument()
        })
      })
    })
  })

  describe('server side', () => {
    beforeEach(() => {
      ;(getRendezVousJeune as jest.Mock).mockResolvedValue([
        unEvenementListItem(),
      ])
      ;(getJeuneDetails as jest.Mock).mockResolvedValue(unDetailJeune())
    })

    describe('quand la session est invalide', () => {
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

    describe('quand la session est valide', () => {
      let actual: GetServerSidePropsResult<any>

      it('récupère les rendez-vous passés d’un jeune avec son conseiller', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: {
            accessToken: 'accessToken',
            user: { id: 'id-conseiller', structure: 'MILO' },
          },
          validSession: true,
        })

        // When
        actual = await getServerSideProps({
          query: { jeune_id: 'id-jeune' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(getJeuneDetails).toHaveBeenCalledWith('id-jeune', 'accessToken')
        expect(getRendezVousJeune).toHaveBeenCalledWith(
          'id-jeune',
          'PASSES',
          'accessToken'
        )
        expect(actual).toEqual({
          props: {
            beneficiaire: unDetailJeune(),
            rdvs: [unEvenementListItem()],
            pageTitle: 'Rendez-vous passés de Jirac Kenji',
            lectureSeule: false,
          },
        })
      })
    })

    describe('quand le conseiller est Pôle emploi', () => {
      let actual: GetServerSidePropsResult<any>

      it('ne recupère pas les rendez-vous', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: { user: { structure: 'POLE_EMPLOI' } },
          validSession: true,
        })

        // When
        actual = await getServerSideProps({
          query: {},
        } as unknown as GetServerSidePropsContext)
        // Then
        expect(getRendezVousJeune).not.toHaveBeenCalled()
        expect(actual).toMatchObject({ props: { rdvs: [] } })
      })
    })
  })
})
