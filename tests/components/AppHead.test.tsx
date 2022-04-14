import { screen, render, within, getNodeText } from '@testing-library/react'
import AppHead from 'components/AppHead'
import { ReactElement } from 'react'

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: Array<ReactElement> }) => {
      return <>{children}</>
    },
  }
})

describe('<AppHead/>', () => {
  it('affiche le titre de la page', () => {
    // Given & When
    render(<AppHead titre='Titre de la page' hasMessageNonLu={false} />, {
      container: document.head,
    })

    // Then
    expect(document.title).toEqual('Titre de la page - Espace conseiller CEJ')
  })

  it('affiche la favicon par défaut', () => {
    // Given & When
    render(<AppHead titre='Titre de la page' hasMessageNonLu={false} />, {
      container: document.head,
    })

    // Then
    expect(
      within(document.head).getByRole('link', { hidden: true })
    ).toBeInTheDocument()
    expect(document.head.querySelector('').getAttribute('href')).toBe('/')
  })
})
