import { render } from '@testing-library/react'
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
  it('par défaut', () => {
    // Given & When
    const { container } = render(
      <AppHead titre='Titre de la page' hasMessageNonLu={false} />,
      {
        container: document.head,
      }
    )

    // Then
    expect(document.title).toEqual('Titre de la page - Espace conseiller CEJ')
    expect(container.querySelector("link[rel='icon']")).toHaveAttribute(
      'href',
      '/favicon.png'
    )
  })

  it('avec message non lu', () => {
    // Given & When
    const { container } = render(
      <AppHead titre='Titre de la page' hasMessageNonLu={true} />,
      {
        container: document.head,
      }
    )

    // Then
    expect(document.title).toEqual(
      'Nouveau(x) message(s) - Espace conseiller CEJ'
    )
    expect(container.querySelector("link[rel='icon']")).toHaveAttribute(
      'href',
      '/favicon_notif.png'
    )
  })
})
