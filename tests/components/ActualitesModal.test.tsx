import { act, render, screen } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'

import ActualitesModal from 'components/ActualitesModal'
import { unConseiller } from 'fixtures/conseiller'
import { ActualitesProvider } from 'utils/actualitesContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'

jest.mock('components/ModalContainer')
describe('ActualitesModal', () => {
  let container

  const actualites = {
    contenu:
      '<h3>Invitation à la journée présentiel du 31 octobre 2024</h3><pre><code>Catégorie</code></pre><p>Rdv demain aux nouveaux locaux de la Fabrique</p><a href="www.google.com">Google</a><img src="pouetImg.jpg" alt="pouet"/><hr />',
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

  it('échape les balises pre, code et hr', () => {
    expect(container.querySelector('hr')).not.toBeInTheDocument()
    expect(container.querySelector('pre')).not.toBeInTheDocument()
    expect(container.querySelector('code')).not.toBeInTheDocument()
  })
})
