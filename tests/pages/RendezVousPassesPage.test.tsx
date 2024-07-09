import { act, screen } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import React from 'react'

import RendezVousPasses from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/rendez-vous-passes/RendezVousPassesPage'
import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import { unEvenementListItem } from 'fixtures/evenement'
import { EvenementListItem } from 'interfaces/evenement'
import renderWithContexts from 'tests/renderWithContexts'

describe('RendezVousPassesPage client side', () => {
  describe('quand il y a des rendez-vous passés', () => {
    let container: HTMLElement
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
      ;({ container } = renderWithContexts(
        <RendezVousPasses
          beneficiaire={uneBaseBeneficiaire()}
          lectureSeule={false}
          rdvs={rdvs}
        />
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results).toHaveNoViolations()
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
        expect(screen.getByText('Non')).not.toHaveAttribute('class', 'sr-only')
        expect(screen.getByText('Oui')).not.toHaveAttribute('class', 'sr-only')
      })

      it('quand la présence du bénéficiaire n’est pas renseignée', async () => {
        // Then
        expect(screen.getByText('information non disponible')).toHaveAttribute(
          'class',
          'sr-only'
        )
      })
    })
  })

  describe('quand il n’y a pas de rendez-vous passés', () => {
    let container: HTMLElement
    beforeEach(async () => {
      // When
      ;({ container } = renderWithContexts(
        <RendezVousPasses
          beneficiaire={uneBaseBeneficiaire()}
          lectureSeule={false}
          rdvs={[]}
        />,
        {}
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results).toHaveNoViolations()
    })

    it('affiche un message', async () => {
      // Then
      expect(
        screen.getByText(
          'Aucun événement ou rendez-vous pour votre bénéficiaire.'
        )
      ).toBeInTheDocument()
    })
  })
})
