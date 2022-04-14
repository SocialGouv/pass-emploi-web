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
  describe('par default',()=>{
    let container: HTMLHeadElement
    beforeEach(() => {
      // Given & When
      ;({ container } = render(
        <AppHead titre='Titre de la page' hasMessageNonLu={false} />,
        {
          container: document.head,
        }
      ))
    })

    it('Affiche le titre de la page', () => {
      // Then
      expect(document.title).toEqual('Titre de la page - Espace conseiller CEJ')
    })

    it('Affiche un favicon', () => {
      // Then
      expect(container.querySelector("link[rel='icon']")).toHaveAttribute(
        'href',
        '/favicon.png'
      )
    })
  })

  describe('avec message non lu', () => {
    let container: HTMLHeadElement
    beforeEach(() => {
      // Given & When
      ;({ container } = render(
        <AppHead titre='Titre de la page' hasMessageNonLu={true} />,
        {
          container: document.head,
        }
      ))
    })
    it('on indique dans le titre de la page "nouveau(x) message(s)', () => {
      // Then
      expect(document.title).toEqual(
        'Nouveau(x) message(s) - Espace conseiller CEJ'
      )
    })

    it('on affiche l’icone de notification', () => {
      // Then
      expect(container.querySelector("link[rel='icon']")).toHaveAttribute(
        'href',
        '/favicon_notif.png'
      )
    })
  })
})
