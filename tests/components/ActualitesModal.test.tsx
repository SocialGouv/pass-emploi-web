import { act, render, screen } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'

import ActualitesModal from 'components/ActualitesModal'
import { desActualitesRaw } from 'fixtures/actualites'
import { unConseiller } from 'fixtures/conseiller'
import { getActualites } from 'services/actualites.service'
import { ActualitesProvider } from 'utils/actualitesContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'

jest.mock('components/ModalContainer')
jest.mock('services/actualites.service', () => ({ getActualites: jest.fn() }))

describe('ActualitesModal', () => {
  let container: HTMLElement

  describe('quand le conseiller a des actualités', () => {
    const conseiller = unConseiller()

    beforeEach(async () => {
      const onClose = jest.fn()
      ;(getActualites as jest.Mock).mockResolvedValue(desActualitesRaw())

      await act(async () => {
        ;({ container } = render(
          <ConseillerProvider conseiller={conseiller}>
            <ActualitesProvider>
              <ActualitesModal onClose={onClose} />
            </ActualitesProvider>
          </ConseillerProvider>
        ))
      })
    })

    it('a11y', async () => {
      let results: AxeResults
      await act(async () => {
        results = await axe(container)
      })
      expect(results!).toHaveNoViolations()
    })

    it('Affiche la modale', () => {
      //Then
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Invitation à la journée présentiel du 31 octobre 2024',
        })
      ).toBeInTheDocument()
      expect(screen.getByRole('banner')).toHaveTextContent(
        'Invitation à la journée présentiel du 31 octobre 2024Catégories : RecetteTest'
      )
      expect(
        screen.getByText('Rdv demain aux nouveaux locaux de la Fabrique')
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: 'Vous êtes perdu ? (nouvelle fenêtre)',
        })
      ).toHaveAttribute('href', 'perdu.com')
      expect(
        screen.getByRole('img', {
          name: 'pouet',
        })
      ).toBeInTheDocument()
    })
  })

  describe('quand le conseiller n’a pas d’actualité', () => {
    const conseiller = unConseiller()

    beforeEach(async () => {
      const onClose = jest.fn()
      ;(getActualites as jest.Mock).mockResolvedValue([])
      await act(async () => {
        ;({ container } = render(
          <ConseillerProvider conseiller={conseiller}>
            <ActualitesProvider>
              <ActualitesModal onClose={onClose} />
            </ActualitesProvider>
          </ConseillerProvider>
        ))
      })
    })

    it('a11y', async () => {
      let results: AxeResults
      await act(async () => {
        results = await axe(container)
      })
      expect(results!).toHaveNoViolations()
    })

    it('Affiche la modale avec un message d’erreur', () => {
      //Then
      expect(
        screen.getByText('Vous n’avez pas d’actualités en cours')
      ).toBeInTheDocument()
    })
  })
})
