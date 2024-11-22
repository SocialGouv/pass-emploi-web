import { act, render, screen } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'

import ActualitesModal from 'components/ActualitesModal'
import { unConseiller } from 'fixtures/conseiller'
import { ActualitesProvider } from 'utils/actualitesContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'

jest.mock('components/ModalContainer')
describe('ActualitesModal', () => {
  let container: HTMLElement

  describe('quand le conseiller a des actualités', () => {
    const article = {
      titre: 'Invitation à la journée présentiel du 31 octobre 2024',
      contenu: (
        <>
          <span>Catégorie</span>
          <p>Rdv demain aux nouveaux locaux de la Fabrique</p>
          <a href='www.google.com'>Google</a>
          <img src='pouetImg.jpg' alt='pouet' />
        </>
      ),
      dateDerniereModification: '2024-01-01',
      id: 'id-article-1',
    }

    const actualites = {
      articles: [article],
      dateDerniereModification: '2024-01-01',
    }
    const conseiller = unConseiller()

    beforeEach(() => {
      let onClose = jest.fn()
      ;({ container } = render(
        <ConseillerProvider conseiller={conseiller}>
          <ActualitesProvider actualitesForTests={actualites}>
            <ActualitesModal onClose={onClose} />
          </ActualitesProvider>
        </ConseillerProvider>
      ))
    })

    it('a11y', async () => {
      let results: AxeResults
      await act(async () => {
        results = await axe(container)
      })
      expect(results).toHaveNoViolations()
    })

    it('Affiche la modale', () => {
      //Then
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Invitation à la journée présentiel du 31 octobre 2024',
        })
      )
      expect(screen.getByText('Catégorie')).toBeInTheDocument()
      expect(
        screen.getByText('Rdv demain aux nouveaux locaux de la Fabrique')
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: 'Google',
        })
      ).toHaveAttribute('href', 'www.google.com')
      expect(
        screen.getByRole('img', {
          name: 'pouet',
        })
      ).toBeInTheDocument()
    })
  })

  describe('quand le conseiller n’a pas d’actualité', () => {
    const actualites = {
      articles: [],
      dateDerniereModification: '2024-01-01',
    }
    const conseiller = unConseiller()

    beforeEach(() => {
      let onClose = jest.fn()
      ;({ container } = render(
        <ConseillerProvider conseiller={conseiller}>
          <ActualitesProvider actualitesForTests={actualites}>
            <ActualitesModal onClose={onClose} />
          </ActualitesProvider>
        </ConseillerProvider>
      ))
    })

    it('a11y', async () => {
      let results: AxeResults
      await act(async () => {
        results = await axe(container)
      })
      expect(results).toHaveNoViolations()
    })

    it('Affiche la modale avec un message d’erreur', () => {
      //Then
      expect(
        screen.getByText('Vous n’avez pas d’actualités en cours')
      ).toBeInTheDocument()
    })
  })
})
