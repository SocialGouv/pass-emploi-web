import { act, render, screen } from '@testing-library/react'

import { uneActualiteRaw } from 'fixtures/actualites'
import { unConseiller } from 'fixtures/conseiller'
import { getActualites } from 'services/actualites.service'
import { ActualitesProvider, useActualites } from 'utils/actualitesContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'

jest.mock('services/actualites.service')
describe('ActualitesProvdider', () => {
  const conseiller = unConseiller()

  beforeEach(async () => {
    ;(getActualites as jest.Mock).mockResolvedValue(uneActualiteRaw())
    await act(async () =>
      render(
        <ConseillerProvider conseiller={conseiller}>
          <ActualitesProvider>
            <FakeActualiteContainer />
          </ActualitesProvider>
        </ConseillerProvider>
      )
    )
  })

  it('recupère les actualités et transforme les liens', () => {
    // Then
    expect(getActualites).toHaveBeenCalledWith(conseiller.structure)
    expect(screen.getByRole('paragraph')).toHaveTextContent(
      'Rdv demain aux nouveaux locaux de la Fabrique'
    )
    const lienExterne = screen.getByRole('link', {
      name: 'Vous êtes perdu ? (nouvelle fenêtre)',
    })
    expect(lienExterne).toHaveAttribute('href', 'perdu.com')
    expect(lienExterne).toHaveAttribute('target', '_blank')
    expect(lienExterne).toHaveAttribute('rel', 'noreferrer noopener')
  })
})

function FakeActualiteContainer() {
  const actualites = useActualites()
  return actualites?.articles[0].contenu
}
